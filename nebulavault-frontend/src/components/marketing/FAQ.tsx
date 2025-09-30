export default function FAQ() {
  const faqs = [
    {
      q: "Is my data encrypted?",
      a: "Yes. Objects are encrypted at rest in S3 and in transit via TLS. Tokens are short-lived and validated at the gateway.",
    },
    {
      q: "How does sharing work?",
      a: "Create time-limited links or grant explicit permissions to members. Owners can revoke access anytime.",
    },
    {
      q: "What does the free tier include?",
      a: "Starter includes 100 MB and basic sharing—perfect for development and light use.",
    },
    {
      q: "Do you support file versioning?",
      a: "Yep—uploads create versions automatically and the UI exposes a quick history.",
    },
    {
      q: "Can I self-host?",
      a: "Nebula Vault is built with a microservice mindset. A self-hosted option is on the roadmap.",
    },
    {
      q: "How do I import existing files?",
      a: "Drag and drop in the Files view or use the API to batch upload with presigned URLs.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-nv-text text-center mb-10">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-nv-border bg-nv-surface/60 backdrop-blur-sm p-5"
            >
              <summary className="cursor-pointer list-none font-semibold text-nv-text flex items-center justify-between">
                {item.q}
                <span className="ml-4 text-nv-muted group-open:rotate-45 transition">
                  +
                </span>
              </summary>
              <p className="mt-3 text-nv-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
