type PdfPreviewProps = {
  url: string
  title: string
}

export function PdfPreview({ url, title }: PdfPreviewProps) {
  return (
    <section className="pdf-preview" aria-labelledby="pdf-preview-title">
      <div className="pdf-preview-heading">
        <div>
          <p className="eyebrow">Alphabet worksheet</p>
          <h2 id="pdf-preview-title">PDF for {title}</h2>
        </div>
        <a className="pdf-open-link" href={url} target="_blank" rel="noreferrer">
          Open in new tab ↗
        </a>
      </div>
      <iframe
        className="pdf-frame"
        src={url}
        title={`PDF worksheet for ${title}`}
        loading="lazy"
      />
    </section>
  )
}
