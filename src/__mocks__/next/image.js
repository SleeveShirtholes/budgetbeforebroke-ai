export default function Image({ src, alt, width, height, className, onClick }) {
  return (
    <div
      data-testid="next-image"
      role="img"
      aria-label={alt}
      style={{
        width,
        height,
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className={className}
      onClick={onClick}
    />
  );
}
