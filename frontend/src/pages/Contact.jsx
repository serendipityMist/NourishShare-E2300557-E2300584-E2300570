import { useState } from 'react';
import PublicLayout from '../components/layout/PublicLayout.jsx';

const CONTACT_INFO = [
  { icon: 'mail', label: 'Email Us', value: 'hello@nourishshare.my' },
  { icon: 'location_on', label: 'Our Kitchen Office', value: 'Bangsar South, Avenue 3, 59200 Kuala Lumpur' },
];

const FAQS = [
  {
    question: 'How do I start a community donation?',
    answer:
      'Simply mark items in your inventory as "Shareable". Local verified community centers in Bangsar and surrounding KL areas will be notified to coordinate a pickup.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'We use bank-level encryption for all user profiles. Your address is only shared with verified partners once you approve a specific donation request.',
  },
  {
    question: 'Can I use NourishShare for business?',
    answer:
      'Yes! We have a Pro tier specifically for local cafes and grocery stores to manage surplus inventory and tax-deductible donation receipts.',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Donation Inquiry', message: '' });
  const [sent, setSent] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <PublicLayout>
      <main className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        <section className="mb-xl text-center md:text-left">
          <h1 className="font-headline-xl text-headline-xl text-primary mb-sm">Get in Touch</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Have questions about your digital pantry or want to collaborate on community donation programs? We're here to help you reduce food waste in Malaysia.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-7 bg-white p-lg md:p-xl border border-outline-variant rounded-xl shadow-sm">
            <h2 className="font-headline-md text-headline-md text-tertiary mb-lg">Send us a message</h2>
            {sent ? (
              <div className="text-center py-xl">
                <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center text-primary mx-auto mb-md">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h3 className="font-headline-md text-primary mb-sm">Message sent</h3>
                <p className="font-body-md text-on-surface-variant">
                  Thanks for reaching out — our team will get back to you soon.
                </p>
              </div>
            ) : (
              <form className="flex flex-col gap-lg" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-md text-label-md text-on-surface">Name</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-lg p-md input-inset focus:ring-2 focus:ring-primary-container font-body-md"
                      placeholder="Ahmad Zaki"
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-md text-label-md text-on-surface">Email</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-lg p-md input-inset focus:ring-2 focus:ring-primary-container font-body-md"
                      placeholder="ahmad@example.com"
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface">Subject</label>
                  <select
                    className="w-full bg-surface-container-low border-none rounded-lg p-md input-inset focus:ring-2 focus:ring-primary-container font-body-md appearance-none"
                    value={form.subject}
                    onChange={(e) => update('subject', e.target.value)}
                  >
                    <option>Donation Inquiry</option>
                    <option>Account Support</option>
                    <option>Partnership Proposal</option>
                    <option>Feedback</option>
                  </select>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface">Message</label>
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-lg p-md input-inset focus:ring-2 focus:ring-primary-container font-body-md"
                    placeholder="Tell us how we can help..."
                    rows={5}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    required
                  />
                </div>

                <button
                  className="bg-primary text-on-primary py-md px-xl rounded-full font-label-md text-label-md self-start hover:opacity-90 transition-all flex items-center gap-sm"
                  type="submit"
                >
                  Send Message
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-lg">
            <div className="bg-tertiary text-on-tertiary p-lg rounded-xl flex flex-col gap-lg">
              <h3 className="font-headline-md text-headline-md">Contact Details</h3>
              {CONTACT_INFO.map((info) => (
                <div key={info.label} className="flex items-start gap-md">
                  <span className="material-symbols-outlined p-sm bg-tertiary-container rounded-lg">{info.icon}</span>
                  <div>
                    <p className="font-label-md text-label-md opacity-70">{info.label}</p>
                    <p className="font-body-lg text-body-lg font-semibold leading-snug">{info.value}</p>
                  </div>
                </div>
              ))}
              <div className="pt-md mt-md border-t border-tertiary-container">
                <p className="font-label-md text-label-md mb-md">Follow our community</p>
                <div className="flex gap-md">
                  <a className="w-10 h-10 flex items-center justify-center bg-tertiary-container rounded-full hover:scale-110 transition-transform" href="#">
                    <span className="material-symbols-outlined">public</span>
                  </a>
                  <a className="w-10 h-10 flex items-center justify-center bg-tertiary-container rounded-full hover:scale-110 transition-transform" href="#">
                    <span className="material-symbols-outlined">camera_enhance</span>
                  </a>
                  <a className="w-10 h-10 flex items-center justify-center bg-tertiary-container rounded-full hover:scale-110 transition-transform" href="#">
                    <span className="material-symbols-outlined">movie_filter</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="relative h-64 rounded-xl overflow-hidden border border-outline-variant shadow-sm group">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="A warm, modern Malaysian kitchen with pantry staples"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_t0PqglsvkAf6b1xGmG5jSZNrqPuz0jl8aPe1UuH4utpjtb9VYi6Glukvwl4CGTbHFYET0olU34Z12txBFNguhU6voJ9aa-HUjCf527CoQf1frnjWrkejMzCy2jJ8g63Iq_eY5cyP32KI6XJOhs5SvNYuW1WpTc4lbrMhCHDc74Yl8pBz4DLrNLKh_xv1bxgdIlxGGDD-wjlELF6LNcP8fczKCJWcwne70_awFlgOObeRUYYoL3g"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-lg">
                <p className="text-white font-label-md text-label-md">
                  Join 5,000+ Malaysian households reducing waste daily.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-xl py-xl border-t border-outline-variant">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-xl">
              <span className="bg-surface-container-highest text-on-surface px-md py-xs rounded-full font-label-sm text-label-sm mb-sm inline-block">
                FREQUENT QUESTIONS
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary">Need a quick answer?</h2>
            </div>
            <div className="flex flex-col gap-md">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between p-lg cursor-pointer hover:bg-surface-container-high transition-colors">
                    <span className="font-headline-md text-headline-md text-on-surface">{faq.question}</span>
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="px-lg pb-lg">
                    <p className="font-body-md text-body-md text-on-surface-variant">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-xl rounded-xl overflow-hidden border border-outline-variant h-[400px] relative shadow-lg">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center grayscale contrast-75 brightness-110"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDCQiqhyDEyHJOpfWRLYw7BHVNz1TXLL4Qoui2lufh6AuDDYD26CUmH8-wSyIuZRmvdytqrk3rdyxwPzb6O4mQEPWJjWCvortKNCJ5qeGaWMOyHDJsLVv8wAcvYHG9PPO1pVWLZD1TxSEnovjP5Uhgd3KwxWfbndoCNf4J6dPuBOjV58Dxjsau20sPa-01OlGlicVYhfS3WBS8R7N16W7JDW_eSD9b6ibxeYneVHTFJPQ3W5l00UJQ')",
            }}
            />
          </div>
          <div className="absolute inset-0 pointer-events-none bg-primary/10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </div>
            <div className="mt-md bg-white px-lg py-sm rounded-lg shadow-xl border border-outline-variant">
              <p className="font-label-md text-label-md font-bold">NourishShare HQ</p>
            </div>
          </div>
          <div className="absolute bottom-lg left-lg bg-white/90 backdrop-blur p-md rounded-lg max-w-xs border border-outline-variant">
            <h4 className="font-label-md text-label-md text-secondary">VISIT OUR HUB</h4>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              Drop by for coffee and a demo of our community fridge technology.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
