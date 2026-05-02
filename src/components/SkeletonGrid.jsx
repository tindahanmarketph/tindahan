export default function SkeletonGrid() {
  return (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-image" />
          <div className="skeleton-line large" />
          <div className="skeleton-line" />
          <div className="skeleton-line small" />
        </div>
      ))}
    </div>
  )
}