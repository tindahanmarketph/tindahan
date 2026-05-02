import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import {
  formatPrice,
  getBuyerProtection,
  getTotalWithProtection
} from '../utils/format'

const categories = [
  { id: 'women', label: 'Women', icon: '👗' },
  { id: 'men', label: 'Men', icon: '👔' },
  { id: 'kids', label: 'Kids', icon: '🧸' },
  { id: 'objects', label: 'Objects', icon: '🏠' }
]

const conditions = [
  {
    id: 'New with tags',
    label: 'New with tags',
    description: 'Never worn or used, original tags attached.'
  },
  {
    id: 'Very good',
    label: 'Very good',
    description: 'Lightly used, no visible flaws.'
  },
  {
    id: 'Good',
    label: 'Good',
    description: 'Used, minor signs of wear.'
  },
  {
    id: 'Fair',
    label: 'Fair',
    description: 'Visible signs of wear, still usable.'
  }
]

const MAX_IMAGES = 8
const MAX_IMAGE_SIZE_MB = 8
const REQUEST_TIMEOUT_MS = 30000

function withTimeout(promise, message = 'Request timeout. Please try again.') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(message))
      }, REQUEST_TIMEOUT_MS)
    })
  ])
}

export default function Sell() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'women',
    condition: 'Very good',
    price: '',
    brand: '',
    size: '',
    location: 'Manila, Philippines',
    is_negotiable: false
  })

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugStep, setDebugStep] = useState('')

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }))
  }

  function handleFiles(event) {
    const selectedFiles = Array.from(event.target.files || [])

    setError('')
    setDebugStep('')

    if (selectedFiles.length > MAX_IMAGES) {
      setFiles([])
      setError(`You can upload a maximum of ${MAX_IMAGES} photos.`)
      return
    }

    const invalidFile = selectedFiles.find((file) => {
      return !file.type.startsWith('image/')
    })

    if (invalidFile) {
      setFiles([])
      setError('Only image files are allowed.')
      return
    }

    const oversizedFile = selectedFiles.find((file) => {
      return file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024
    })

    if (oversizedFile) {
      setFiles([])
      setError(`Each image must be smaller than ${MAX_IMAGE_SIZE_MB} MB.`)
      return
    }

    setFiles(selectedFiles)
  }

  function validateForm() {
    if (!user) {
      throw new Error('You must be logged in to publish a listing.')
    }

    if (!profile) {
      throw new Error(
        'Your profile was not found. Log out, log in again, then try publishing.'
      )
    }

    if (!form.title.trim()) {
      throw new Error('Please add a title.')
    }

    if (!form.description.trim()) {
      throw new Error('Please add a description.')
    }

    if (!form.price) {
      throw new Error('Please add a price.')
    }

    if (Number(form.price) <= 0) {
      throw new Error('Price must be higher than 0.')
    }

    if (files.length === 0) {
      throw new Error('Please upload at least one photo.')
    }

    if (files.length > MAX_IMAGES) {
      throw new Error(`You can upload a maximum of ${MAX_IMAGES} photos.`)
    }
  }

  async function createListing() {
    const payload = {
      seller_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      condition: form.condition,
      price: Number(form.price),
      brand: form.brand.trim() || null,
      size: form.size.trim() || null,
      location: form.location.trim() || 'Philippines',
      is_negotiable: form.is_negotiable,
      status: 'active'
    }

    const { data, error: listingError } = await withTimeout(
      supabase.from('listings').insert(payload).select('*').single(),
      'Listing creation took too long. Please check your Supabase database.'
    )

    if (listingError) {
      throw new Error(`Listing creation failed: ${listingError.message}`)
    }

    if (!data?.id) {
      throw new Error('Listing was created but no listing ID was returned.')
    }

    return data
  }

  async function uploadImages(listingId) {
    const uploadedRows = []

    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const safeFileName = `${Date.now()}-${index}.${fileExt}`
      const filePath = `${user.id}/${listingId}/${safeFileName}`

      setDebugStep(`Uploading photo ${index + 1}/${files.length}...`)

      const { error: uploadError } = await withTimeout(
        supabase.storage.from('listing-images').upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        }),
        `Photo ${index + 1} upload took too long. Try with a smaller image.`
      )

      if (uploadError) {
        throw new Error(`Photo upload failed: ${uploadError.message}`)
      }

      const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath)

      if (!publicUrlData?.publicUrl) {
        throw new Error('Could not generate public image URL.')
      }

      uploadedRows.push({
        listing_id: listingId,
        image_url: publicUrlData.publicUrl,
        sort_order: index
      })
    }

    if (uploadedRows.length > 0) {
      setDebugStep('Saving photo links...')

      const { error: imageInsertError } = await withTimeout(
        supabase.from('listing_images').insert(uploadedRows),
        'Saving image links took too long. Please check your Supabase table.'
      )

      if (imageInsertError) {
        throw new Error(`Saving image links failed: ${imageInsertError.message}`)
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading) {
      return
    }

    setLoading(true)
    setError('')
    setDebugStep('Checking form...')

    try {
      validateForm()

      setDebugStep('Creating listing...')
      const listing = await createListing()

      await uploadImages(listing.id)

      setDebugStep('Listing published successfully.')
      navigate(`/item/${listing.id}`)
    } catch (submitError) {
      console.error('Publish listing error:', submitError)
      setError(submitError.message || 'Something went wrong while publishing.')
      setDebugStep('')
      setLoading(false)
    }
  }

  const price = Number(form.price || 0)
  const buyerProtection = getBuyerProtection(price)
  const total = getTotalWithProtection(price)

  return (
    <div className="page narrow-page">
      <div className="sell-header">
        <h1>Sell an item</h1>
        <p>Create a clean listing in a few minutes.</p>
      </div>

      {error && <div className="alert error">{error}</div>}

      {debugStep && !error && (
        <div className="alert success">
          {debugStep}
        </div>
      )}

      <form className="sell-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Photos</h2>
          <p>
            Add up to {MAX_IMAGES} photos. Each image must be smaller than{' '}
            {MAX_IMAGE_SIZE_MB} MB. The first photo will be used as cover.
          </p>

          <input type="file" accept="image/*" multiple onChange={handleFiles} />

          {files.length > 0 && (
            <div className="preview-grid">
              {files.map((file, index) => (
                <div className="preview-image" key={`${file.name}-${index}`}>
                  <img src={URL.createObjectURL(file)} alt={file.name} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="form-section">
          <h2>Item details</h2>

          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="ex: Nike hoodie"
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Describe the item, condition, fit, defects..."
              rows="5"
            />
          </label>

          <label>
            Brand
            <input
              value={form.brand}
              onChange={(event) => updateField('brand', event.target.value)}
              placeholder="ex: Nike"
            />
          </label>

          <label>
            Size
            <input
              value={form.size}
              onChange={(event) => updateField('size', event.target.value)}
              placeholder="ex: M, L, 38, One size"
            />
          </label>

          <label>
            Location
            <input
              value={form.location}
              onChange={(event) => updateField('location', event.target.value)}
              placeholder="ex: Manila, Philippines"
            />
          </label>
        </section>

        <section className="form-section">
          <h2>Category</h2>

          <div className="choice-grid">
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={`choice-card ${
                  form.category === category.id ? 'selected' : ''
                }`}
                onClick={() => updateField('category', category.id)}
              >
                <span>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Condition</h2>

          <div className="condition-list">
            {conditions.map((condition) => (
              <button
                type="button"
                key={condition.id}
                className={`condition-card ${
                  form.condition === condition.id ? 'selected' : ''
                }`}
                onClick={() => updateField('condition', condition.id)}
              >
                <strong>{condition.label}</strong>
                <span>{condition.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Price</h2>

          <label>
            Price in Philippine pesos
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              placeholder="ex: 650"
            />
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={form.is_negotiable}
              onChange={(event) =>
                updateField('is_negotiable', event.target.checked)
              }
            />
            Price is negotiable
          </label>

          <div className="price-preview">
            <div>
              <span>Item price</span>
              <strong>{formatPrice(price)}</strong>
            </div>
            <div>
              <span>Buyer Protection 8%</span>
              <strong>{formatPrice(buyerProtection)}</strong>
            </div>
            <div className="total-line">
              <span>Buyer total before shipping</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>
        </section>

        <button className="primary-button large-button" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish listing'}
        </button>
      </form>
    </div>
  )
}