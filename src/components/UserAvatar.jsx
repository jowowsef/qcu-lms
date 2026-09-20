function UserAvatar({ src, name, className = "" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "User"}
        className={`${className} object-cover`}
      />
    )
  }

  return (
    <div className={className}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  )
}

export default UserAvatar
