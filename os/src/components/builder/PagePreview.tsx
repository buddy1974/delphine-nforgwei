"use client";

import type { SectionRow } from "@/lib/db/pages";
import type { OsBrand } from "@/lib/brands";

interface PagePreviewProps {
  title: string;
  sections: SectionRow[];
  brand: OsBrand;
}

export default function PagePreview({ title, sections, brand }: PagePreviewProps) {
  if (sections.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 p-8">
        <div className="text-5xl">📄</div>
        <p className="text-sm font-semibold text-gray-400">No sections yet</p>
        <p className="text-xs text-gray-300 text-center">
          Add sections from the left panel to see a preview here.
        </p>
      </div>
    );
  }

  return (
    <div className="font-sans bg-white min-h-full">
      {sections.map((s) => (
        <SectionPreview key={s.id} section={s} brand={brand} />
      ))}
    </div>
  );
}

function SectionPreview({ section, brand }: { section: SectionRow; brand: OsBrand }) {
  switch (section.type) {
    case "hero":
      return (
        <div
          className="relative px-10 py-20 text-center"
          style={{
            background: `linear-gradient(135deg, ${brand.accent}18 0%, ${brand.accent}08 100%)`,
          }}
        >
          {section.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={section.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="relative z-10">
            {section.title && (
              <h1 className="text-4xl font-bold text-charcoal mb-3 leading-tight">
                {section.title}
              </h1>
            )}
            {section.subtitle && (
              <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto">{section.subtitle}</p>
            )}
            {section.button_label && (
              <span
                className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm"
                style={{ backgroundColor: brand.accent }}
              >
                {section.button_label}
              </span>
            )}
          </div>
        </div>
      );

    case "text":
      return (
        <div className="px-10 py-12">
          {section.title && (
            <h2 className="text-2xl font-bold text-charcoal mb-3">{section.title}</h2>
          )}
          {section.subtitle && (
            <p className="text-base font-semibold text-gray-600 mb-4">{section.subtitle}</p>
          )}
          {section.body && (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{section.body}</p>
          )}
        </div>
      );

    case "image":
      return (
        <div className="px-10 py-8">
          {section.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={section.image_url}
              alt={section.title ?? ""}
              className="w-full rounded-2xl object-cover max-h-80"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 text-sm">
              No image selected
            </div>
          )}
          {section.title && (
            <p className="text-xs text-gray-400 text-center mt-2 italic">{section.title}</p>
          )}
        </div>
      );

    case "cards":
      return (
        <div className="px-10 py-12 bg-gray-50">
          {section.title && (
            <h2 className="text-2xl font-bold text-charcoal mb-2 text-center">{section.title}</h2>
          )}
          {section.subtitle && (
            <p className="text-sm text-gray-500 text-center mb-8">{section.subtitle}</p>
          )}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div
                  className="w-8 h-8 rounded-lg mb-3"
                  style={{ backgroundColor: `${brand.accent}30` }}
                />
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-2 bg-gray-100 rounded w-full mb-1" />
                <div className="h-2 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      );

    case "cta":
      return (
        <div
          className="px-10 py-14 text-center"
          style={{ backgroundColor: brand.accent }}
        >
          {section.title && (
            <h2 className="text-2xl font-bold text-white mb-3">{section.title}</h2>
          )}
          {section.subtitle && (
            <p className="text-white/80 text-base mb-6">{section.subtitle}</p>
          )}
          {section.button_label && (
            <span className="inline-block bg-white px-6 py-3 rounded-xl font-bold text-sm" style={{ color: brand.accent }}>
              {section.button_label}
            </span>
          )}
        </div>
      );

    case "event_block":
      return (
        <div className="px-10 py-10">
          <div
            className="rounded-2xl p-6 border-l-4 bg-gray-50 border-gray-200"
            style={{ borderLeftColor: brand.accent }}
          >
            {section.title && (
              <h3 className="text-xl font-bold text-charcoal mb-1">{section.title}</h3>
            )}
            {section.subtitle && (
              <p className="text-sm text-gray-500 mb-4">{section.subtitle}</p>
            )}
            {section.body && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{section.body}</p>
            )}
            {section.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={section.image_url} alt="" className="w-full rounded-xl object-cover h-40 mb-4" />
            )}
            {section.button_label && (
              <span
                className="inline-block px-5 py-2.5 rounded-xl font-bold text-white text-sm"
                style={{ backgroundColor: brand.accent }}
              >
                {section.button_label}
              </span>
            )}
          </div>
        </div>
      );

    case "program_card":
      return (
        <div className="px-10 py-10 bg-gray-50">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {section.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={section.image_url} alt="" className="w-full h-40 object-cover" />
            )}
            <div className="p-6">
              {section.title && (
                <h3 className="text-lg font-bold text-charcoal mb-1">{section.title}</h3>
              )}
              {section.subtitle && (
                <p className="text-sm font-semibold text-gray-500 mb-3">{section.subtitle}</p>
              )}
              {section.body && (
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{section.body}</p>
              )}
              {section.button_label && (
                <span
                  className="inline-block px-5 py-2.5 rounded-xl font-bold text-white text-sm"
                  style={{ backgroundColor: brand.accent }}
                >
                  {section.button_label}
                </span>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
