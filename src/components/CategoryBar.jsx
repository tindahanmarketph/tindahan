import { Link, useSearchParams } from 'react-router-dom'

const categories = [
  { id: 'women', label: 'Women', icon: '👗' },
  { id: 'men', label: 'Men', icon: '👔' },
  { id: 'kids', label: 'Kids', icon: '🧸' },
  { id: 'objects', label: 'Objects', icon: '🏠' }
]

export default function CategoryBar() {
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')

  return (
    <div className="category-bar">
      <Link
        to="/"
        className={`category-pill ${!activeCategory ? 'active' : ''}`}
      >
        ✨ All
      </Link>

      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/?category=${category.id}`}
          className={`category-pill ${
            activeCategory === category.id ? 'active' : ''
          }`}
        >
          {category.icon} {category.label}
        </Link>
      ))}
    </div>
  )
}