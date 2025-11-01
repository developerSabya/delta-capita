import React, { useEffect, useRef, useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.entry'

GlobalWorkerOptions.workerSrc = ''

export default function PdfViewer({ blob }) {
  const canvasRef = useRef(null)
  const [pdf, setPdf] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.0)

  useEffect(() => {
    const load = async () => {
      const array = await blob.arrayBuffer()
      const loadingTask = getDocument({ data: array })
      const loaded = await loadingTask.promise
      setPdf(loaded)
      setNumPages(loaded.numPages)
      setPageNum(1)
    }
    load().catch((e) => console.error(e))
    return () => {
      if (pdf) pdf.destroy()
    }
  }, [blob])

  useEffect(() => {
    const render = async () => {
      if (!pdf) return
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const renderContext = {
        canvasContext: ctx,
        viewport
      }
      await page.render(renderContext).promise
    }
    render().catch((e) => console.error(e))
  }, [pdf, pageNum, scale])

  const prev = () => setPageNum((p) => Math.max(1, p - 1))
  const next = () => setPageNum((p) => Math.min(numPages, p + 1))
  const zoomIn = () => setScale((s) => Math.min(3, s + 0.25))
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25))
  const download = () => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'signed.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pdfviewer">
      <div className="viewer-controls">
        <div className="pager">
          <button onClick={prev} disabled={pageNum <= 1}>&lt;</button>
          <span>{pageNum} / {numPages}</span>
          <button onClick={next} disabled={pageNum >= numPages}>&gt;</button>
        </div>
        <div className="zoom">
          <button onClick={zoomOut}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn}>+</button>
        </div>
        <div>
          <button onClick={download}>Download</button>
        </div>
      </div>
      <div className="pdfviewer-body">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
    </div>
  )
}
