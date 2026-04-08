
class EmployeeTable {
  constructor() {
    try {
      this.allEmployees   = [];
      this.filtered       = [];
      this.currentPage    = 1;
      this.perPage        = 10;
      this.sortField      = 'monthlySalary';  
      this.sortDir        = 'desc';           
      this.modal          = new bootstrap.Modal(document.getElementById('empModal'));

      this._bindEvents();
      this._loadData();
    } catch (error) {
      console.error('Error initializing EmployeeTable:', error);
      this._showError('Failed to initialize the application. Please refresh the page.');
    }
  }

  _loadData() {
    try {
      $.ajax({
        url: '/EmployeeData_16-03-2026.json',
        method: 'GET',
        dataType: 'json',
        success: (data) => {
          try {
            this.allEmployees = Array.isArray(data) ? data : [];
            this._applyFilters();
            $('#totalCount').text(this.allEmployees.length);
          } catch (error) {
            console.error('Error processing employee data:', error);
            this._showError('Error processing employee data. Please check the data format.');
            this._renderRows([]);
          }
        },
        error: (xhr, status, err) => {
          console.error('AJAX Error:', { xhr, status, err });
          this._showError(`Failed to load employee data. (${err || status || 'Unknown error'})`);
          this._renderRows([]);
        }
      });
    } catch (error) {
      console.error('Error in _loadData:', error);
      this._showError('Unexpected error occurred while loading data.');
      this._renderRows([]);
    }
  }

  _bindEvents() {
    try {
      this._bindSearchInput();
      this._bindPerPageSelect();
      this._bindSortHeaders();
      this._bindDetailButtons();
    } catch (error) {
      console.error('Error binding events:', error);
      this._showError('Error initializing application.');
    }
  }

  _bindSearchInput() {
    let searchTimer;
    $('#searchInput').on('input', () => {
      try {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          try {
            this.currentPage = 1;
            this._applyFilters();
          } catch (error) {
            console.error('Error in search timeout:', error);
            this._showError('Error applying search filter.');
          }
        }, 280);
      } catch (error) {
        console.error('Error in search input handler:', error);
      }
    });
  }

  _bindPerPageSelect() {
    $('#perPage').on('change', () => {
      try {
        this.perPage = parseInt($('#perPage').val());
        this.currentPage = 1;
        this._render();
      } catch (error) {
        console.error('Error in perPage change handler:', error);
        this._showError('Error changing page size.');
      }
    });
  }

  _bindSortHeaders() {
    $(document).on('click', 'th.sortable', (e) => {
      try {
        const field = $(e.currentTarget).data('field');
        if (this.sortField === field) {
          this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortField = field;
          this.sortDir = 'asc';
        }

        this._sortFiltered();
        this._updateSortHeaders();
        this.currentPage = 1;
        this._render();
      } catch (error) {
        console.error('Error in sort header click handler:', error);
        this._showError('Error sorting data.');
      }
    });
  }

  _bindDetailButtons() {
    $(document).on('click', '.btn-view', (e) => {
      try {
        const id = $(e.currentTarget).data('id');
        const emp = this.allEmployees.find(x => x.employeeId === id);
        if (emp) {
          this._showModal(emp);
        } else {
          this._showError('Employee not found.');
        }
      } catch (error) {
        console.error('Error in view button click handler:', error);
        this._showError('Error opening employee details.');
      }
    });
  }

  _applyFilters() {
    try {
      const q = $('#searchInput').val().toLowerCase().trim();
      this.filtered = this.allEmployees.filter(emp => this._matchesSearchQuery(emp, q));
      this._sortFiltered();
      this._render();
    } catch (error) {
      console.error('Error in _applyFilters:', error);
      this._showError('Error applying filters. Please try again.');
      this.filtered = [...this.allEmployees];
      this._render();
    }
  }

  _matchesSearchQuery(emp, query) {
    try {
      if (!query) return true;
      const dept = DEPARTMENTS[emp.department]?.name || '';
      return (
        (emp.name  || '').toLowerCase().includes(query) ||
        (emp.email || '').toLowerCase().includes(query) ||
        dept.toLowerCase().includes(query) ||
        (emp.phone || '').includes(query)
      );
    } catch (error) {
      console.error('Error filtering employee:', error, emp);
      return false;
    }
  }

  _sortFiltered() {
    if (!this.sortField) return;

    try {
      this.filtered.sort((a, b) => this._compareEmployees(a, b));
    } catch (error) {
      console.error('Error in _sortFiltered:', error);
      this._showError('Error sorting data. Please try again.');
    }
  }

  _compareEmployees(a, b) {
    try {
      const va = this._getSortValue(a);
      const vb = this._getSortValue(b);

      if (va < vb) return this.sortDir === 'asc' ? -1 : 1;
      if (va > vb) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    } catch (error) {
      console.error('Error comparing employees for sorting:', error, { a, b });
      return 0;
    }
  }

  _getSortValue(emp) {
    try {
      if (this.sortField === 'department') {
        return (DEPARTMENTS[emp.department]?.name || '').toLowerCase();
      }

      if (this.sortField === 'monthlySalary') {
        return Number(emp.monthlySalary || 0);
      }

      return String(emp[this.sortField] || '').toLowerCase();
    } catch (error) {
      console.error('Error getting sort value:', error, emp);
      return '';
    }
  }

  _render() {
    try {
      const total = this.filtered.length;
      const start = (this.currentPage - 1) * this.perPage;
      const page  = this.filtered.slice(start, start + this.perPage);

      this._renderRows(page);
      this._renderPagination(total, start);
    } catch (error) {
      console.error('Error in _render:', error);
      this._showError('Error rendering the table. Please refresh the page.');
    }
  }

  _renderRows(rows) {
    const $body = $('#empBody');
    $body.empty();

    if (!rows.length) {
      $body.html('<tr class="state-row"><td colspan="6"><i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:.5rem;"></i>No employees found.</td></tr>');
      return;
    }

    rows.forEach((emp, idx) => {
      try {
        const $row = this._createEmployeeRow(emp, idx);
        $body.append($row);
      } catch (error) {
        console.error('Error rendering employee row:', error, emp);
        this._showError('Error displaying employee data');
      }
    });
  }

  _createEmployeeRow(emp, idx) {
    const deptBadge = this._getDepartmentBadge(emp);
    const { genderDisplay, genderClass } = this._getGenderDisplay(emp);
    const clickableEmail = Utils.createClickableLink(emp.email, emp.email, true);
    const clickablePhone = Utils.createClickableLink(Utils.formatPhoneNumber(emp.phone), emp.phone, false);

    return $(
      `
        <tr style="animation-delay:${idx * 40}ms">
          <td>
            <div class="emp-name">${Utils.escapeHtml(emp.name)}</div>
            <div class="emp-id">${Utils.escapeHtml(emp.employeeId)}</div>
          </td>
          <td><span class="gender-badge ${genderClass}">${genderDisplay}</span></td>
          <td>${deptBadge}</td>
          <td style="font-size:0.83rem;">${clickableEmail}</td>
          <td style="font-size:0.83rem;">${clickablePhone}</td>
          <td style="text-align:center;">
            <button class="btn-view" data-id="${Utils.escapeHtml(emp.employeeId)}" title="View details">
              <i class="bi bi-eye"></i>
            </button>
          </td>
        </tr>
      `
    );
  }

  _getDepartmentBadge(emp) {
    const dept = DEPARTMENTS[emp.department] || { name: 'Unknown', color: '#fff', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' };
    return `<span class="dept-badge" style="color:${dept.color};background:${dept.bg};border:1px solid ${dept.border};">${dept.name}</span>`;
  }

  _getGenderDisplay(emp) {
    if (emp.gender === 'F') {
      return { genderDisplay: 'F', genderClass: 'gender-F' };
    }
    return { genderDisplay: 'M', genderClass: 'gender-M' };
  }

  _renderPagination(total, start) {
    const end      = Math.min(start + this.perPage, total);
    const pages    = Math.ceil(total / this.perPage);
    const cur      = this.currentPage;

    $('#pageInfo').text(total === 0 ? 'No results' : `Showing ${start + 1}–${end} of ${total} employees`);

    const $btns = $('#pageBtns').empty();
    if (pages <= 1) return;

    const mkBtn = (label, pg, icon = false) => {
      const $b = $(`<button class="page-btn ${pg === cur ? 'active' : ''}" ${(pg < 1 || pg > pages) ? 'disabled' : ''}>${icon ? `<i class="bi bi-${label}"></i>` : label}</button>`);
      $b.on('click', () => { if (pg >= 1 && pg <= pages) { this.currentPage = pg; this._render(); } });
      return $b;
    };

    $btns.append(mkBtn('chevron-double-left', 1, true));
    $btns.append(mkBtn('chevron-left', cur - 1, true));

    const window_ = 2;
    for (let p = Math.max(1, cur - window_); p <= Math.min(pages, cur + window_); p++) {
      $btns.append(mkBtn(p, p));
    }

    $btns.append(mkBtn('chevron-right', cur + 1, true));
    $btns.append(mkBtn('chevron-double-right', pages, true));
  }

  _showModal(emp) {
    try {
      if (!emp) {
        this._showError('Employee data not found.');
        return;
      }

      const html = this._getModalHtml(emp);
      $('#modalBody').html(html);
      this.modal.show();

      setTimeout(() => {
        $('.exp-bar-fill').css('width', `${this._getExperiencePct(emp)}%`);
      }, 200);
    } catch (error) {
      console.error('Error showing modal:', error, emp);
      this._showError('Error displaying employee details.');
    }
  }

  _getModalHtml(emp) {
    const dept     = DEPARTMENTS[emp.department] || { name: 'Unknown', color: '#fff' };
    const initial  = (emp.name || '?')[0].toUpperCase();
    const expPct   = this._getExperiencePct(emp);

    return `
      <div class="employee-hero">
        <div class="emp-avatar">${initial}</div>
        <div>
          <div class="emp-hero-name">${Utils.escapeHtml(emp.name)}</div>
          <div class="emp-hero-designation">${Utils.escapeHtml(emp.designation)}</div>
          <div class="emp-hero-id">${Utils.escapeHtml(emp.employeeId)}</div>
        </div>
        <div style="margin-left:auto;">
          <span class="dept-badge" style="color:${dept.color};background:rgba(0,0,0,0.2);border:1px solid ${dept.color}40;font-size:0.85rem;">${dept.name}</span>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">📧 Email</div>
          <div class="detail-value" style="word-break:break-all;font-size:0.83rem;">${Utils.escapeHtml(emp.email)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">📞 Phone</div>
          <div class="detail-value">${Utils.escapeHtml(emp.phone)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">👤 Gender</div>
          <div class="detail-value">${emp.gender === 'F' ? 'Female' : 'Male'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">🎂 Date of Birth</div>
          <div class="detail-value">${DateHelper.format(emp.dob)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">📅 Date of Joining</div>
          <div class="detail-value">${DateHelper.format(emp.dateOfJoining)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">💰 Monthly Salary</div>
          <div class="detail-value">₹${Number(emp.monthlySalary || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">🏙️ City</div>
          <div class="detail-value">${Utils.escapeHtml(emp.city)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">🗺️ State</div>
          <div class="detail-value">${Utils.escapeHtml(emp.state)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">📮 Postcode</div>
          <div class="detail-value">${Utils.escapeHtml(emp.postcode)}</div>
        </div>
        ${emp.remarks ? `<div class="detail-item full">
          <div class="detail-label">📝 Remarks</div>
          <div class="detail-value" style="font-size:0.85rem;color:rgba(240,238,255,0.8);">${Utils.escapeHtml(emp.remarks)}</div>
        </div>` : ''}
      </div>

      <div class="exp-bar-wrap">
        <div class="exp-label">⏱ Total Experience</div>
        <div class="exp-bar-bg"><div class="exp-bar-fill" style="width:0" data-pct="${expPct}"></div></div>
        <div class="exp-text">${Utils.escapeHtml(emp.totalExperience || '—')}</div>
      </div>
    `;
  }

  _getExperiencePct(emp) {
    const expYears = Utils.parseExperienceYears(emp.totalExperience);
    return Math.min((expYears / 20) * 100, 100).toFixed(0);
  }

  _updateSortHeaders() {
    try {
      $('th.sortable').removeClass('sort-asc sort-desc');
      $('th.sortable .sort-icon').attr('class', 'sort-icon bi bi-chevron-expand');
      if (this.sortField) {
        const $th = $(`th[data-field="${this.sortField}"]`);
        $th.addClass(this.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
        $th.find('.sort-icon').attr('class', `sort-icon bi bi-chevron-${this.sortDir === 'asc' ? 'up' : 'down'}`);
      }
    } catch (error) {
      console.error('Error updating sort headers:', error);
    }
  }

  _showError(msg) {
    try {
      const $wrap = $('#toastWrap').show();
      $('#toastMsg').html(`<i class="bi bi-exclamation-triangle-fill"></i> ${msg}`);
      setTimeout(() => {
        try {
          $wrap.fadeOut();
        } catch (fadeError) {
          console.error('Error fading out toast:', fadeError);
          $wrap.hide();
        }
      }, 5000);
    } catch (error) {
      console.error('Error showing error message:', error, msg);
      alert(msg); 
    }
  }
}