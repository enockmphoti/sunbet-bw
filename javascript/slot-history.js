const attributes = {
  container: "[cg_slots_history_container]",
  table: "[cg_slots_history_table]",
  templateRow: "[cg_slots_history_template_row]",
};
 
function clearExistingRows() {
  const table = document.querySelector(attributes.table);
  const tbody = table?.querySelector("tbody");
  if (!tbody) return;
 
  const rows = tbody.querySelectorAll(
    "tr:not([cg_slots_history_template_row])"
  );
  rows.forEach((row) => row.remove());
}
 
function displaySlotHistory() {
  console.log("Fetching slot history...");
 
  clearExistingRows();
 
  let currentPage = 1;
  const itemsPerPage = 20;
  let allData = [];
 
  function createPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationDiv = document.createElement("div");
   
    const paginationStyles = `
      <style>
        .betslip-pagination-controls.is-slots-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin: 10px 0;
          width: 100%;
          padding: 15px;
          position: relative;
        }
       
        .table-scroll-container {
          position: relative;
          overflow-x: auto;
          overflow-y: visible;
          margin-bottom: 15px;
          width: 100%;
          border-radius: 8px;
        }
       
        .table-scroll-container table {
          min-width: 100%;
          white-space: nowrap;
        }
       
        .table-horizontal-scroller {
          height: 15px;
          background: linear-gradient(135deg, #1a365d 0%, #2d4a73 100%);
          border-radius: 12px;
          margin: 15px 20px 25px 20px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(45, 90, 160, 0.4);
        }
       
        .table-scroll-thumb {
          height: 100%;
          background: linear-gradient(135deg, #ff8c00 0%, #ffa500 50%, #ffb347 100%);
          border-radius: 12px;
          transition: all 0.2s ease;
          min-width: 30px;
          cursor: grab;
          box-shadow: 0 2px 6px rgba(255, 140, 0, 0.4);
          border: 1px solid rgba(255, 140, 0, 0.6);
          position: relative;
        }
       
        .table-scroll-thumb:hover {
          background: linear-gradient(135deg, #ffa500 0%, #ffb347 50%, #ffd700 100%);
          box-shadow: 0 3px 8px rgba(255, 140, 0, 0.6);
        }
       
        .table-scroll-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
       
        @media (max-width: 767px) {
          .table-horizontal-scroller {
            margin: 10px 15px 20px 15px;
            height: 6px;
          }
        }
       
        .pagination-block {
          min-width: 35px;
          height: 35px;
          border: 1px solid #ff8c00;
          background: linear-gradient(135deg, #1a365d 0%, #2d4a73 100%);
          color: #ffffff;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          position: relative;
        }
       
        .pagination-block:hover {
          background: linear-gradient(135deg, #2d4a73 0%, #4a76a8 100%);
          border-color: #ffa500;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
       
        .pagination-block.is-active {
          background: linear-gradient(135deg, #ff8c00 0%, #ffa500 100%);
          border-color: #ff8c00;
          color: #ffffff;
          font-weight: 700;
          box-shadow: 0 3px 8px rgba(255, 140, 0, 0.4);
        }
       
        .pagination-block.is-active:hover {
          background: linear-gradient(135deg, #ffa500 0%, #ffb347 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(255, 140, 0, 0.5);
        }
       
        .pagination-arrow {
          min-width: 35px;
          height: 35px;
          border: 1px solid #ff8c00;
          background: linear-gradient(135deg, #1a365d 0%, #2d4a73 100%);
          color: #ffffff;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          font-size: 12px;
          font-weight: bold;
        }
       
        .pagination-arrow:hover:not(.disabled) {
          background: linear-gradient(135deg, #2d4a73 0%, #4a76a8 100%);
          border-color: #ffa500;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
       
        .pagination-arrow.disabled {
          background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 100%);
          border-color: #555555;
          color: #777777;
          cursor: not-allowed;
          opacity: 0.5;
        }
       
        .pagination-double-arrow {
          min-width: 35px;
          height: 35px;
          border: 1px solid #ff8c00;
          background: linear-gradient(135deg, #1a365d 0%, #2d4a73 100%);
          color: #ffffff;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          font-size: 10px;
          font-weight: bold;
          letter-spacing: -1px;
        }
       
        .pagination-double-arrow:hover:not(.disabled) {
          background: linear-gradient(135deg, #2d4a73 0%, #4a76a8 100%);
          border-color: #ffa500;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
       
        .pagination-double-arrow.disabled {
          background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 100%);
          border-color: #555555;
          color: #777777;
          cursor: not-allowed;
          opacity: 0.5;
        }
       
        .pagination-dots {
          color: #ffffff;
          font-weight: 500;
          padding: 0 8px;
          display: flex;
          align-items: center;
        }
       
        @media (max-width: 767px) {
          .pagination-block,
          .pagination-arrow,
          .pagination-double-arrow {
            min-width: 30px;
            height: 30px;
            font-size: 11px;
          }
         
          .betslip-pagination-controls.is-slots-pagination {
            gap: 5px;
            margin: 20px 0;
            padding: 15px;
          }
        }
      </style>
    `;
   
    if (!document.querySelector('#pagination-styles')) {
      const styleElement = document.createElement('div');
      styleElement.id = 'pagination-styles';
      styleElement.innerHTML = paginationStyles;
      document.head.appendChild(styleElement);
    }
 
    paginationDiv.className = "betslip-pagination-controls is-slots-pagination";
 
    const maxVisiblePages = window.innerWidth > 767 ? 5 : 3;
 
    const firstButton = document.createElement("button");
    firstButton.className = `pagination-double-arrow ${currentPage === 1 ? 'disabled' : ''}`;
    firstButton.type = "button";
    firstButton.innerHTML = "◄◄";
    firstButton.onclick = () => {
      if (currentPage > 1) {
        currentPage = 1;
        updatePagination();
      }
    };
    paginationDiv.appendChild(firstButton);
 
    const prevButton = document.createElement("button");
    prevButton.className = `pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.type = "button";
    prevButton.innerHTML = "◄";
    prevButton.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        updatePagination();
      }
    };
    paginationDiv.appendChild(prevButton);
 
    let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
    let endPage = startPage + maxVisiblePages - 1;
 
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }
 
    if (startPage > 1) {
      paginationDiv.appendChild(createPageButton(1, "1"));
      if (startPage > 2) {
        const dots = document.createElement("span");
        dots.className = "pagination-dots";
        dots.textContent = "...";
        paginationDiv.appendChild(dots);
      }
    }
 
    for (let i = startPage; i <= endPage; i++) {
      paginationDiv.appendChild(createPageButton(i, i));
    }
 
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement("span");
        dots.className = "pagination-dots";
        dots.textContent = "...";
        paginationDiv.appendChild(dots);
      }
      paginationDiv.appendChild(createPageButton(totalPages, totalPages));
    }
 
    const nextButton = document.createElement("button");
    nextButton.className = `pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.type = "button";
    nextButton.innerHTML = "►";
    nextButton.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
      }
    };
    paginationDiv.appendChild(nextButton);
 
    const lastButton = document.createElement("button");
    lastButton.className = `pagination-double-arrow ${currentPage === totalPages ? 'disabled' : ''}`;
    lastButton.type = "button";
    lastButton.innerHTML = "►►";
    lastButton.onclick = () => {
      if (currentPage < totalPages) {
        currentPage = totalPages;
        updatePagination();
      }
    };
    paginationDiv.appendChild(lastButton);
 
    function createPageButton(page, text) {
      const pageButton = document.createElement("button");
      pageButton.className = "pagination-block";
      pageButton.type = "button";
      pageButton.innerText = text;
 
      if (page === currentPage) {
        pageButton.classList.add("is-active");
      }
 
      pageButton.onclick = () => {
        currentPage = page;
        updatePagination();
      };
 
      return pageButton;
    }
 
    function updatePagination() {
      const existingPagination = document.querySelector('.betslip-pagination-controls.is-slots-pagination');
      if (existingPagination) {
        existingPagination.remove();
      }
     
      const container = document.querySelector(attributes.container);
      const newPaginationControls = createPaginationControls(allData.length);
      container.appendChild(newPaginationControls);
     
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageData = allData.slice(startIndex, endIndex);
      displayPage(pageData);
    }
 
    return paginationDiv;
  }
 
  function formatDateTime(date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} | ${hh}:${min}`;
  }
 
  function displayPage(pageData) {
    clearExistingRows();
 
    const table = document.querySelector(attributes.table);
    const tbody = table?.querySelector("tbody");
    const templateRow = document.querySelector(attributes.templateRow);
    if (!tbody || !templateRow) return;
    templateRow.classList.add("hide");
    const isMobile = window.innerWidth <= 767;
    const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
      th.textContent.trim()
    );
 
    if (!isMobile) {
      createTableScroller();
    }
 
    pageData.forEach((item) => {
      const row = templateRow.cloneNode(true);
      row.classList.remove("hide");
      row.removeAttribute("cg_slots_history_template_row");
 
      const values = [
        item.roundId || "-",
        item.game || "-",
        formatDateTime(item.gameStartTime) || "-",
        formatDateTime(item.gameEndTime) || "-",
        item.numberOfFreeSpins || 0,
        `R${item.bet?.toFixed(2) || "0.00"}`,
        item.win?.toFixed(2) || "0.00",
        item.balance?.toFixed(2) || "0.00",
        item.operatorName || "Sunbet Pty Ltd",
        item.wagerType || "SINGLE BET",
        item.userName || "",
        item.address ||
          "1st Floor, Eagle Park, C/O Bosmansdam & Omuramba Road, Milnerton, Cape Town, 7447",
        item.additionalInfo ||
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      ];
 
      const cells = row.querySelectorAll("td");
 
      values.forEach((val, i) => {
        const td = cells[i];
        if (!td) return;
 
        const valueDiv = td.querySelector("[cg_cell_value]");
        const keyDiv = td.querySelector("[cg_cell_key]");
 
        if (valueDiv) valueDiv.textContent = val;
        keyDiv.textContent = headers[i];
      });
 
      tbody.appendChild(row);
    });
  }
 
  function createTableScroller() {
    const existingScroller = document.querySelector('.table-horizontal-scroller');
    if (existingScroller) {
      existingScroller.remove();
    }
 
    const table = document.querySelector(attributes.table);
    const container = document.querySelector(attributes.container);
   
    if (!table || !container) return;
 
    table.style.minWidth = '1200px';
 
    let tableContainer = table.closest('.table-scroll-container');
    if (!tableContainer) {
      const scrollContainer = document.createElement('div');
      scrollContainer.className = 'table-scroll-container';
      table.parentNode.insertBefore(scrollContainer, table);
      scrollContainer.appendChild(table);
      tableContainer = scrollContainer;
    }
 
    const scroller = document.createElement('div');
    scroller.className = 'table-horizontal-scroller';
   
    const thumb = document.createElement('div');
    thumb.className = 'table-scroll-thumb';
    scroller.appendChild(thumb);
 
    tableContainer.parentNode.insertBefore(scroller, tableContainer.nextSibling);
 
    function updateScrollerDimensions() {
      const tableWidth = table.scrollWidth;
      const containerWidth = tableContainer.clientWidth;
     
      if (tableWidth <= containerWidth) {
        scroller.style.display = 'none';
        return;
      }
     
      scroller.style.display = 'block';
      const scrollRatio = containerWidth / tableWidth;
      const thumbWidth = Math.max(20, scrollRatio * 100);
     
      thumb.style.width = `${thumbWidth}%`;
     
      const scrollLeft = tableContainer.scrollLeft;
      const maxScroll = tableWidth - containerWidth;
      const scrollProgress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      const maxThumbTravel = 100 - thumbWidth;
      thumb.style.transform = `translateX(${scrollProgress * maxThumbTravel}%)`;
    }
 
    tableContainer.addEventListener('scroll', (e) => {
      updateScrollerDimensions();
    });
 
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
 
    thumb.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startScrollLeft = tableContainer.scrollLeft;
      e.preventDefault();
      e.stopPropagation();
      document.body.style.userSelect = 'none';
    });
 
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
     
      const deltaX = e.clientX - startX;
      const scrollerWidth = scroller.clientWidth;
      const thumbWidthPercent = parseFloat(thumb.style.width);
      const thumbWidthPx = (thumbWidthPercent / 100) * scrollerWidth;
      const maxThumbTravel = scrollerWidth - thumbWidthPx;
     
      if (maxThumbTravel <= 0) return;
     
      const scrollRatio = deltaX / maxThumbTravel;
      const maxTableScroll = table.scrollWidth - tableContainer.clientWidth;
     
      const newScrollLeft = Math.max(0, Math.min(maxTableScroll, startScrollLeft + (scrollRatio * maxTableScroll)));
      tableContainer.scrollLeft = newScrollLeft;
    });
 
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = '';
      }
    });
 
    scroller.addEventListener('click', (e) => {
      if (e.target === scroller) {
        const rect = scroller.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const scrollerWidth = rect.width;
        const clickRatio = clickX / scrollerWidth;
        const maxTableScroll = table.scrollWidth - tableContainer.clientWidth;
       
        tableContainer.scrollLeft = clickRatio * maxTableScroll;
      }
    });
 
    setTimeout(() => {
      updateScrollerDimensions();
    }, 100);
   
    window.addEventListener('resize', updateScrollerDimensions);
  }
 
  function attemptFetch() {
    try {
      simlBC.getHistory(0, function (err, response) {
        if (err) {
          console.error("Error fetching history:", err);
          return;
        }
 
        const table = document.querySelector(attributes.table);
        const container = document.querySelector(attributes.container);
 
        if (!table || !container) {
          console.error("Table or container not found");
          return;
        }
 
        if (response && response.length > 0) {
          allData = response;
 
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const pageData = allData.slice(startIndex, endIndex);
 
          const paginationControls = createPaginationControls(allData.length);
          container.appendChild(paginationControls);
 
          displayPage(pageData);
        } else {
          const tbody = table.querySelector("tbody");
          const noRow = document.createElement("tr");
          const td = document.createElement("td");
          td.colSpan = 13;
          td.textContent = "No slot history available";
          td.style.textAlign = "center";
          noRow.appendChild(td);
          tbody.appendChild(noRow);
        }
      });
    } catch (err) {
      console.error("Error in fetch attempt:", err);
    }
  }
 
  attemptFetch();
}
 
document.addEventListener("DOMContentLoaded", displaySlotHistory);