import "./Gallery.css";

function Gallery() {
  const images = [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
  ];

  return (
    <section className="gallery" id="gallery">
      <h2>Our Work</h2>

      <div className="gallery-grid">
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Car ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}

export default Gallery;