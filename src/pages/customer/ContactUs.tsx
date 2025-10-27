import { useState } from "react";
import Header from "@/components/customer/Header";

const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send the form data to your backend or email service
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container py-12">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-primary">Contact Us</h1>
          <p className="text-lg text-muted-foreground mb-8 text-center">
            Have a question, feedback, or need support? Fill out the form below and our team will get back to you soon.
          </p>
          {submitted ? (
            <div className="bg-green-100 text-green-800 p-6 rounded-lg text-center font-semibold">
              Thank you for reaching out! We'll respond as soon as possible.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 font-medium" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 w-full"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
