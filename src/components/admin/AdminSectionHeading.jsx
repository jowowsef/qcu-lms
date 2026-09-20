function AdminSectionHeading({ title, description }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
    </div>
  )
}

export default AdminSectionHeading
