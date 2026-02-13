/*
 * Accordion Solutions Block
 * Custom accordion with header and image grid layout
 * Migrated from Figma: SWBC Home Page Redesign
 */

export default function decorate(block) {
  // Get all rows
  const rows = [...block.children];

  // First row is the header (eyebrow + main heading)
  const headerRow = rows[0];
  if (headerRow) {
    headerRow.className = 'accordion-solutions-header';
    const headerCells = [...headerRow.children];
    if (headerCells[0]) {
      headerCells[0].className = 'accordion-solutions-eyebrow';
    }
    if (headerCells[1]) {
      headerCells[1].className = 'accordion-solutions-main-heading';
    }
  }

  // Create content wrapper for accordion + images
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'accordion-solutions-content';

  // Create accordion container
  const accordionContainer = document.createElement('div');
  accordionContainer.className = 'accordion-solutions-list';

  // Create images container
  const imagesContainer = document.createElement('div');
  imagesContainer.className = 'accordion-solutions-images';

  // Process remaining rows
  rows.slice(1).forEach((row, index) => {
    const cells = [...row.children];

    // Check if this is an image row (has picture element)
    const hasPicture = row.querySelector('picture');

    if (hasPicture) {
      // This is an images row
      cells.forEach((cell) => {
        const pictures = cell.querySelectorAll('picture');
        pictures.forEach((picture) => {
          const imageWrapper = document.createElement('div');
          imageWrapper.className = 'accordion-solutions-image-wrapper';
          imageWrapper.appendChild(picture.cloneNode(true));
          imagesContainer.appendChild(imageWrapper);
        });
      });
      row.remove();
    } else {
      // This is an accordion item
      const label = cells[0];
      const body = cells[1];

      if (label && body) {
        const summary = document.createElement('summary');
        summary.className = 'accordion-item-label';
        summary.append(...label.childNodes);

        body.className = 'accordion-item-body';

        const details = document.createElement('details');
        details.className = 'accordion-item';

        // Open first item by default
        if (index === 0) {
          details.setAttribute('open', '');
        }

        details.append(summary, body);
        accordionContainer.appendChild(details);
        row.remove();
      }
    }
  });

  // Assemble the layout
  contentWrapper.appendChild(accordionContainer);
  contentWrapper.appendChild(imagesContainer);

  // Insert after header
  if (headerRow && headerRow.nextSibling) {
    block.insertBefore(contentWrapper, headerRow.nextSibling);
  } else {
    block.appendChild(contentWrapper);
  }
}
