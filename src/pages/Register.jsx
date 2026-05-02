import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!form.username || !form.email || !form.password) {
      setError('Please fill all fields.')
      setLoading(false)
      return
    }

    const cleanUsername = form.username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')

    const { error: signUpError } = await signUp({
      email: form.email.trim(),
      password: form.password,
      username: cleanUsername
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setMessage('Account created. You can now log in.')
    setLoading(false)

    setTimeout(() => {
      navigate('/login')
    }, 1000)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p>Join TindaHan and start selling second-hand items.</p>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            Username
            <input
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
              placeholder="ex: maria_manila"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="you@email.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Minimum 6 characters"
            />
          </label>

          <button className="primary-button" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}