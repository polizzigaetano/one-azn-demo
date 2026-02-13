/*
 * Stats Trust Block
 * Displays trust statistics with header and 2x2 card grid
 * Migrated from Figma: SWBC Home Page Redesign
 */

export default function decorate(block) {
  const rows = [...block.children];

  // Create wrapper for two-column layout
  const wrapper = document.createElement('div');
  wrapper.className = 'stats-trust-wrapper';

  // Create header section
  const header = document.createElement('div');
  header.className = 'stats-trust-header';

  // Create stats grid
  const grid = document.createElement('div');
  grid.className = 'stats-trust-grid';

  let cardIndex = 0;

  rows.forEach((row, index) => {
    const cells = [...row.children];

    if (index === 0) {
      // First row is header: eyebrow | heading | CTA
      if (cells[0]) {
        const eyebrow = document.createElement('div');
        eyebrow.className = 'stats-trust-eyebrow';
        eyebrow.innerHTML = cells[0].innerHTML;
        header.appendChild(eyebrow);
      }
      if (cells[1]) {
        const heading = document.createElement('div');
        heading.className = 'stats-trust-heading';
        heading.innerHTML = cells[1].innerHTML;
        header.appendChild(heading);
      }
      if (cells[2]) {
        // Check for existing link or create button wrapper
        const ctaContent = cells[2].querySelector('a');
        if (ctaContent) {
          ctaContent.className = 'stats-trust-cta';
          header.appendChild(ctaContent);
        } else {
          const cta = document.createElement('a');
          cta.className = 'stats-trust-cta';
          cta.href = '#';
          cta.textContent = cells[2].textContent.trim();
          header.appendChild(cta);
        }
      }
      row.remove();
    } else {
      // Stat card rows: number | heading | description
      const card = document.createElement('div');
      card.className = 'stats-trust-card';

      // First card gets highlight class
      if (cardIndex === 0) {
        card.classList.add('highlight');
      }

      if (cells[0]) {
        const number = document.createElement('div');
        number.className = 'stats-trust-number';
        number.textContent = cells[0].textContent.trim();
        card.appendChild(number);
      }

      const content = document.createElement('div');
      content.className = 'stats-trust-content';

      if (cells[1]) {
        const statHeading = document.createElement('div');
        statHeading.className = 'stats-trust-stat-heading';
        statHeading.textContent = cells[1].textContent.trim();
        content.appendChild(statHeading);
      }

      if (cells[2]) {
        const statBody = document.createElement('div');
        statBody.className = 'stats-trust-stat-body';
        statBody.textContent = cells[2].textContent.trim();
        content.appendChild(statBody);
      }

      card.appendChild(content);
      grid.appendChild(card);
      row.remove();
      cardIndex++;
    }
  });

  // Assemble layout
  wrapper.appendChild(header);
  wrapper.appendChild(grid);
  block.appendChild(wrapper);
}
