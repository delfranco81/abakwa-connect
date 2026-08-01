import "./Contact.css";

function Contact() {
  return (
    <section className="contact" id="contact">
      <h2>Contact Us</h2>

      <div className="contact-container">
        <div className="contact-info">
          <h3>abakwa connect</h3>
          <p>📍 Bamenda, Cameroon</p>

          <p>📞 +237 676 089 134 </p>
          <p>📞 +237 694 012 002 </p>


          <p>📧 delfranco81@gmail.com</p>

          <p>🕒 Mon - Sat: 8:00 AM - 6:00 PM</p>
          <p>🕒 sun  7:00 AM - 6:00 PM</p>
        </div>

        <form className="contact-form">
          <input
            type="text"
            placeholder="Your Name"
          />

          <input
            type="email"
            placeholder="Your Email"
          />
          <input
           type="whatsapp pr phone number"
           placeholder="Your whatsapp or phone number"
           />
          <textarea
            rows={5}
            placeholder="Your Message"
          ></textarea>

          <button type="submit">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;