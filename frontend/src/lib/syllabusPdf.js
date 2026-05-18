import { jsPDF } from 'jspdf';
import logoAnmel from '../images/logo_anmel_transparent.png';

const categoryLabel = {
  cybersecurity: 'Cybersecurity',
  'web-development': 'Web development',
  'ux-design': 'UX / UI design',
};

/**
 * Generates and downloads a syllabus PDF for the given course (client-side).
 */
let logoDataUrlPromise = null;

async function loadLogoDataUrl() {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch(logoAnmel)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onloadend = () => resolve(fr.result);
            fr.onerror = reject;
            fr.readAsDataURL(blob);
          }),
      )
      .catch(() => null);
  }
  return logoDataUrlPromise;
}

export async function downloadSyllabusPdf(course) {
  if (!course?.slug) return;

  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const maxW = pageW - margin * 2;
  let y = 34;
  const logoDataUrl = await loadLogoDataUrl();

  const ensureSpace = (needed = 10) => {
    if (y + needed > pageH - 18) {
      doc.addPage();
      y = 34;
    }
  };

  const writeLines = (text, fontSize, lineHeight, gapAfter = 4) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(String(text), maxW);
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += gapAfter;
  };

  doc.setFont('helvetica', 'bold');
  writeLines('Anmel Inc — Course syllabus', 11, 5, 6);

  doc.setFont('helvetica', 'bold');
  writeLines(course.title || 'Course', 16, 6, 4);

  doc.setFont('helvetica', 'normal');
  const track = categoryLabel[course.category] || course.category || '—';
  const meta = [track, course.durationWeeks ? `${course.durationWeeks} weeks` : null, course.level || null]
    .filter(Boolean)
    .join(' · ');
  writeLines(meta, 10, 5, 3);
  if (course.tagline) {
    doc.setFont('helvetica', 'italic');
    writeLines(course.tagline, 10, 5, 6);
    doc.setFont('helvetica', 'normal');
  }

  if (course.format) {
    writeLines(`Format: ${course.format}`, 9, 4, 4);
  }

  const hl = Array.isArray(course.highlights) ? course.highlights : [];
  if (hl.length) {
    doc.setFont('helvetica', 'bold');
    writeLines('Overview & assessment', 11, 5, 2);
    doc.setFont('helvetica', 'normal');
    hl.forEach((h) => writeLines(`• ${h}`, 9, 4.2, 2));
  }

  doc.setFont('helvetica', 'bold');
  writeLines('Curriculum — topics, labs, skills & assignments', 12, 5, 4);
  doc.setFont('helvetica', 'normal');

  const modules = Array.isArray(course.modules) ? course.modules : [];
  if (modules.length === 0) {
    writeLines('Detailed module list will be published soon. Visit the program page for updates.', 10, 5, 6);
  } else {
    modules.forEach((m, idx) => {
      doc.setFont('helvetica', 'bold');
      writeLines(`Module ${idx + 1}: ${m.title || 'Untitled'}`, 11, 5, 2);
      doc.setFont('helvetica', 'normal');
      if (m.summary) writeLines(m.summary, 10, 4.5, 2);
      const topics = Array.isArray(m.topics) ? m.topics : [];
      if (topics.length) {
        doc.setFont('helvetica', 'bold');
        writeLines('Topics', 9, 4, 1);
        doc.setFont('helvetica', 'normal');
        topics.forEach((t) => {
          writeLines(`• ${t}`, 9, 4.2, 1);
        });
      }
      const labs = Array.isArray(m.labs) ? m.labs : [];
      if (labs.length) {
        doc.setFont('helvetica', 'bold');
        writeLines('Hands-on labs', 9, 4, 2);
        doc.setFont('helvetica', 'normal');
        labs.forEach((lab) => {
          const title = typeof lab === 'string' ? lab : lab?.title || 'Lab';
          const focus = typeof lab === 'string' ? '' : lab?.focus || '';
          doc.setFont('helvetica', 'bold');
          writeLines(title, 9, 4.2, 1);
          doc.setFont('helvetica', 'normal');
          if (focus) writeLines(focus, 8, 3.8, 2);
        });
      }
      const skills = Array.isArray(m.skillsGained) ? m.skillsGained : [];
      if (skills.length) {
        doc.setFont('helvetica', 'bold');
        writeLines('Skills gained', 9, 4, 1);
        doc.setFont('helvetica', 'normal');
        skills.forEach((s) => writeLines(`• ${s}`, 9, 4.2, 1));
      }
      if (m.assignment) {
        doc.setFont('helvetica', 'bold');
        writeLines('Weekly assignment', 9, 4, 1);
        doc.setFont('helvetica', 'normal');
        writeLines(m.assignment, 9, 4.2, 2);
      }
      y += 3;
      ensureSpace(12);
    });
  }

  const rg = Array.isArray(course.resourceGuide) ? course.resourceGuide : [];
  if (rg.length) {
    doc.setFont('helvetica', 'bold');
    writeLines('External resources & references', 11, 5, 2);
    doc.setFont('helvetica', 'normal');
    rg.forEach((block) => {
      if (block?.heading) {
        doc.setFont('helvetica', 'bold');
        writeLines(block.heading, 10, 4.5, 1);
        doc.setFont('helvetica', 'normal');
      }
      (block?.items || []).forEach((line) => writeLines(`• ${line}`, 8, 3.8, 1));
      y += 2;
    });
  }

  if (course.prerequisites?.length) {
    doc.setFont('helvetica', 'bold');
    writeLines('Prerequisites', 11, 5, 2);
    doc.setFont('helvetica', 'normal');
    course.prerequisites.forEach((p) => writeLines(`• ${p}`, 9, 4.2, 1));
    y += 2;
  }

  if (course.outcomes) {
    ensureSpace(20);
    doc.setFont('helvetica', 'bold');
    writeLines('Learning outcomes', 11, 5, 2);
    doc.setFont('helvetica', 'normal');
    writeLines(course.outcomes, 9, 4.5, 4);
  }

  const generatedAt = new Date().toLocaleString();
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);

    // Letterhead
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', margin, 8, 22, 10);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(22, 30, 45);
    doc.text('Anmel Inc', margin + 26, 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 98, 115);
    doc.text('Education Department · Official Course Syllabus', margin + 26, 17.5);
    doc.setDrawColor(212, 216, 223);
    doc.setLineWidth(0.25);
    doc.line(margin, 22, pageW - margin, 22);

    // Watermark (center on each page)
    if (logoDataUrl) {
      const wmW = 88;
      const wmH = 88;
      doc.addImage(logoDataUrl, 'PNG', (pageW - wmW) / 2, (pageH - wmH) / 2, wmW, wmH);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(46);
      doc.setTextColor(238, 240, 244);
      doc.text('Anmel Inc', pageW / 2, pageH / 2, { align: 'center' });
    }

    // Footer
    doc.setDrawColor(228, 232, 238);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 108, 122);
    doc.text(`Generated ${generatedAt}`, margin, pageH - 7.5);
    doc.text(`Page ${page} of ${pageCount}`, pageW - margin, pageH - 7.5, { align: 'right' });
  }

  const safe = String(course.slug).replace(/[^a-z0-9-_]/gi, '_');
  doc.save(`Anmel Inc-syllabus-${safe}.pdf`);
}
