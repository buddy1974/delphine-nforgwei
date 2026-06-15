export default function HelpPage() {
  return (
    <div className="max-w-3xl space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal mb-1">Help & Support</h1>
        <p className="text-sm text-gray-500">
          Resources for managing the Delphine Ecosystem OS. For urgent technical issues,
          contact your administrator.
        </p>
      </div>

      {/* Getting started */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Getting Started
        </p>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          <FaqItem
            q="How do I add a new page to a website?"
            a="Click the brand name in the sidebar (e.g. Delphine) to open the website workspace. Use the toolbar button labeled '+ Page' to open the new page form. Enter a title and confirm — the slug is auto-generated. The editor opens immediately."
          />
          <FaqItem
            q="How do I publish a page?"
            a="Open the brand workspace and select the page from the tab row. Click 'Publish' in the top-right toolbar. The status badge changes to Published. To revert, click 'Unpublish' — the page returns to Draft."
          />
          <FaqItem
            q="How do I edit the content of a section?"
            a="In the brand workspace, click 'Edit Sections' in the toolbar. Then click any section on the canvas — the inspector panel opens on the right. Edit the title, body, image URL, or button fields. Changes autosave within 700ms."
          />
          <FaqItem
            q="How do I add a blog post?"
            a="Click a brand in the sidebar, then click '+ Post' in the toolbar — or navigate to the brand's Blog module via the Pages list. Enter a title to create the post, then fill in all fields in the Post Editor."
          />
          <FaqItem
            q="How do I add an event?"
            a="Click a brand in the sidebar, then click '+ Event' in the toolbar — or navigate to the brand's Events module. Enter a title to create the event. The Event Editor lets you set date, time, location, price, image, and registration link."
          />
        </div>
      </section>

      {/* Media & content */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Media & Images
        </p>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          <FaqItem
            q="How do I upload images?"
            a="Click 'Media' in the sidebar (or the Media link in the Pages module). Drag and drop an image into the upload area, or click 'Upload image' to browse your computer. Images up to 10 MB are supported. The image URL is then available to copy and paste into any section field."
          />
          <FaqItem
            q="Where are images stored?"
            a="Images are stored in Supabase Storage. The Media Manager connects to the active Supabase project. Ensure SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are set in your environment variables."
          />
          <FaqItem
            q="Can I share images between brands?"
            a="Each brand has its own media library. At this stage, images are scoped per brand. Cross-brand image sharing is a planned enhancement for a future phase."
          />
        </div>
      </section>

      {/* Status workflow */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Content Status Workflow
        </p>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-gray-100 flex-shrink-0 text-[10px] font-bold text-gray-500 flex items-center justify-center mt-0.5">D</span>
            <div>
              <p className="text-sm font-semibold text-charcoal">Draft</p>
              <p className="text-xs text-gray-500">Default state. Content is saved but not visible on the live website. Safe to edit freely.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-amber-100 flex-shrink-0 text-[10px] font-bold text-amber-700 flex items-center justify-center mt-0.5">R</span>
            <div>
              <p className="text-sm font-semibold text-charcoal">In Review</p>
              <p className="text-xs text-gray-500">Flagged for internal review before publishing. Not yet live. Set this status from the Post or Event Editor.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-green-100 flex-shrink-0 text-[10px] font-bold text-green-700 flex items-center justify-center mt-0.5">P</span>
            <div>
              <p className="text-sm font-semibold text-charcoal">Published</p>
              <p className="text-xs text-gray-500">Live on the website. Visitors can see this content. Use the Unpublish button to revert to Draft.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Messages & Payments */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Messages & Payments
        </p>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          <FaqItem
            q="How do messages arrive in the OS?"
            a="Messages are submitted via the contact form on each brand's public website. The form posts to the OS API, which creates a conversation record. Future phases will add WhatsApp and email inbound channels."
          />
          <FaqItem
            q="How do I mark a message as resolved?"
            a="Open the Messages module from the sidebar. Select the conversation, then use the Status dropdown in the thread view to change it from Open to Pending or Resolved."
          />
          <FaqItem
            q="How do Payments work?"
            a="Clients pay via PayUnit payment links attached to events. When payment is confirmed, the client submits their payment reference via the website form, which creates a payment claim in the Payments module. You verify and confirm each claim manually."
          />
        </div>
      </section>

      {/* Settings & environment */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Settings & Environment
        </p>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          <FaqItem
            q="What environment variables are required?"
            a="NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (required). Optional: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (notifications), OPENAI_API_KEY (AI Studio). Set these in .env.local for local development or in the Vercel project dashboard for production."
          />
          <FaqItem
            q="How do I add a new OS user?"
            a="New OS users must be created in Supabase Authentication (Auth → Users → Invite user). The OS does not currently have a user management UI — this is planned for a future admin phase."
          />
          <FaqItem
            q="Something is broken. What do I do?"
            a="Check the browser console for errors. If the issue is a database error, check Supabase Logs (Logs → API). If you see a TypeScript build error, run `npx tsc --noEmit` in the os/ directory. Report persistent issues to your technical team."
          />
        </div>
      </section>

      {/* Contact */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Contact
        </p>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-sm text-charcoal font-semibold mb-1">Technical Support</p>
          <p className="text-sm text-gray-500 mb-4">
            For issues requiring technical intervention, contact the system administrator.
          </p>
          <a
            href="mailto:support@delphine-nforgwei.com"
            className="inline-flex items-center gap-2 text-sm font-semibold text-plum border border-plum/30 rounded-xl px-5 py-2.5 hover:bg-plum/5 transition-colors"
          >
            Email Support
          </a>
        </div>
      </section>

    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="px-5 py-4">
      <p className="text-sm font-semibold text-charcoal mb-1">{q}</p>
      <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
    </div>
  );
}
