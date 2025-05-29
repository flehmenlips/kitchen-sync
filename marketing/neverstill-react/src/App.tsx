import './App.css';

const cloudName = 'dhaacekdd';
const folder = 'Neverstill';

// Use actual public IDs provided by the user
const heroImage = "https://res.cloudinary.com/dhaacekdd/image/upload/c_fill,g_auto,h_250,w_970/b_rgb:000000,e_gradient_fade,y_-0.50/c_scale,co_rgb:ffffff,fl_relative,l_text:montserrat_25_style_light_align_center:Shop%20Now,w_0.5,y_0.18/v1748505398/NeverstillRanchCowsMist_w2vqxy.jpg";
const galleryImages = [
  `https://res.cloudinary.com/${cloudName}/image/upload/${folder}/moonrise-farmhouse_jeo1ab.jpg`,
];
const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${folder}/IMG_5765_w9errz.mp4`;
const mapImage = `https://res.cloudinary.com/${cloudName}/image/upload/${folder}/Map_cnlhc9.jpg`;
const logo = `https://res.cloudinary.com/${cloudName}/image/upload/400PX-newLOGO_xv5agk.jpg`;

function App() {
  return (
    <div className="brochure-root">
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-overlay">
          <img src={logo} alt="Neverstill Logo" className="hero-logo" />
          <h1>Neverstill Ranch</h1>
          <h2>Oregon's Premier Private Retreat & Airfield</h2>
          <p className="hero-tagline">131+ acres of riverfront, airfield, and luxury living—just 1 hour from Portland</p>
          <a href="#contact" className="cta-btn">Schedule a Tour</a>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2>About the Property</h2>
        <p>
          Welcome to Neverstill Ranch—a rare opportunity to own a breathtaking 131.75-acre estate featuring a private airfield, direct river access, and a beautifully restored farmhouse. Whether you're seeking a luxury retreat, an equestrian paradise, or a unique investment, Neverstill offers unmatched privacy, natural beauty, and endless possibilities.
        </p>
        <ul className="features-list">
          <li>Private airfield (FAA registered)</li>
          <li>Riverfront access for fishing, kayaking, and relaxation</li>
          <li>4-bedroom, 2-bath home with rustic charm and modern amenities</li>
          <li>Two large barns—perfect for horses, events, or storage</li>
          <li>Secluded, yet only 1 hour from Portland</li>
        </ul>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {galleryImages.map((img, idx) => (
            <img key={idx} src={img} alt={`Neverstill property view ${idx + 1}`} className="gallery-img" />
          ))}
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <h2>Experience Neverstill</h2>
        <div className="property-video" style={{width: '100%', maxWidth: 700, margin: '0 auto'}}>
          <iframe
            src="https://player.cloudinary.com/embed/?cloud_name=dhaacekdd&public_id=IMG_5765_w9errz&profile=cld-default"
            allow="autoplay; fullscreen"
            frameBorder="0"
            width="100%"
            height="400"
            title="Neverstill Ranch Video"
            style={{borderRadius: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.12)'}}
          ></iframe>
        </div>
      </section>

      {/* Investment Section */}
      <section className="investment-section">
        <h2>Investment Opportunity</h2>
        <p>
          Neverstill Ranch is more than a home—it's a legacy property with strong potential for appreciation. Develop as a luxury estate, event venue, eco-tourism destination, or private retreat. Comparable properties in the region have sold for $1.8M–$2.5M, and unique features like the airfield and riverfront set Neverstill apart.
        </p>
        <ul className="investment-list">
          <li>Potential for luxury development or subdivision</li>
          <li>Ideal for aviation enthusiasts, equestrian use, or hospitality</li>
          <li>Strong market demand for unique rural estates</li>
        </ul>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <h2>Location</h2>
        <img src={mapImage} alt="Map of Neverstill Ranch location" className="map-img" />
        <p>Birkenfeld, Oregon — 1 hour from Portland, nestled in the scenic Nehalem Valley</p>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <h2>Contact & Schedule a Tour</h2>
        <p>
          Interested in Neverstill Ranch? Schedule a private tour or request more information today.
        </p>
        <a href="mailto:info@neverstillranch.com" className="cta-btn">Email Us</a>
        <p className="contact-phone">or call (555) 123-4567</p>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Neverstill Ranch. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
