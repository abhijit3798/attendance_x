import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import CustomDropdown from '../components/CustomDropdown';

export default function Reports() {
  const context = useContext(AppContext) || {};
  const {
    calendarLogs = {},
    triggerBanner = () => {},
    companies = [],
    records = [],
    leaves = []
  } = context;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Filter out archived companies
  const activeCompanies = (companies || []).filter(c => c && !c.isArchived);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper date conversions
  const getRecordDateString = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Generate Year picker range (5 years back to current year)
  const years = [];
  for (let y = currentYear - 5; y <= currentYear; y++) {
    years.push(y);
  }

  // Calculate statistics for a given month prefix (YYYY-MM)
  const getStatsForMonth = (monthStr) => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    
    Object.keys(calendarLogs || {}).forEach(date => {
      if (date && date.startsWith(monthStr)) {
        const log = calendarLogs[date];
        if (log) {
          if (log.status === 'PRESENT' || log.status === 'OVERTIME') present++;
          else if (log.status === 'ABSENT') absent++;
          else if (log.status === 'HALFDAY') {
            present += 0.5;
            absent += 0.5;
          } else if (log.status === 'LEAVE') leave++;
        }
      }
    });

    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 100.0;
    return { present, absent, leave, percentage, total };
  };

  // Workplace stats calculated specifically inside the selected month/year
  const getCompanyStatsForSelectedMonth = (companyId, monthPrefix) => {
    const compRecs = (records || []).filter(r => r && r.companyId === companyId && r.timestamp && getRecordDateString(r.timestamp).startsWith(monthPrefix));
    const compLeaves = (leaves || []).filter(l => l && l.companyId === companyId && l.date && l.date.startsWith(monthPrefix) && l.status === 'APPROVED');

    let present = 0;
    let absent = 0;

    compRecs.forEach(r => {
      if (r.status === 'PRESENT' || r.status === 'OVERTIME') {
        present += 1;
      } else if (r.status === 'ABSENT') {
        absent += 1;
      } else if (r.status === 'HALFDAY') {
        present += 0.5;
        absent += 0.5;
      }
    });

    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 100.0;

    return {
      present,
      absent,
      leaves: compLeaves.length,
      percentage
    };
  };

  const getShortMonthName = (monthIdx) => {
    return monthNames[monthIdx].slice(0, 3);
  };

  const shortMonth = getShortMonthName(selectedMonth);
  const fileNameCsv = `Attendance_Report_${shortMonth}_${selectedYear}.csv`;
  const fileNamePdf = `Attendance_Report_${shortMonth}_${selectedYear}.pdf`;

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (year === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  };

  const exportCSV = () => {
    const monthPrefix = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`;
    const stats = getStatsForMonth(monthPrefix);

    let csv = 'data:text/csv;charset=utf-8,';
    csv += `Report Month,${monthNames[selectedMonth]} ${selectedYear}\r\n`;
    csv += `Overall Attendance Rate,${stats.percentage.toFixed(1)}%\r\n`;
    csv += `Total Present,${stats.present}\r\n`;
    csv += `Total Absent,${stats.absent}\r\n`;
    csv += `Total Leaves,${stats.leave}\r\n\r\n`;
    
    csv += 'Workplace Summary\r\n';
    csv += 'Workplace Name,Attendance %,Present Count,Leave Count\r\n';
    activeCompanies.forEach(c => {
      const s = getCompanyStatsForSelectedMonth(c.id, monthPrefix);
      csv += `${c.name},${s.percentage.toFixed(0)}%,${s.present},${s.leaves}\r\n`;
    });
    csv += '\r\n';

    const monthLogs = Object.keys(calendarLogs || {}).filter(date => date && date.startsWith(monthPrefix));
    csv += 'Daily Attendance Log\r\n';
    csv += 'Date,Status,Shift,Notes\r\n';
    monthLogs.forEach(date => {
      const log = calendarLogs[date];
      if (log) {
        csv += `${date},${log.status},${log.shift || 'GENERAL'},"${log.notes || ''}"\r\n`;
      }
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = fileNameCsv;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerBanner('CSV Downloaded!');
  };

  const exportPDF = () => {
    const monthName = monthNames[selectedMonth];
    const monthPrefix = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`;
    const stats = getStatsForMonth(monthPrefix);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      triggerBanner('Pop-up blocked! Allow pop-ups to print PDF.');
      return;
    }

    const summaryRowsHtml = activeCompanies.map(c => {
      const s = getCompanyStatsForSelectedMonth(c.id, monthPrefix);
      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${c.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${s.percentage.toFixed(0)}%</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${s.present}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${s.leaves}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${fileNamePdf}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
            h1 { color: #047857; margin-bottom: 5px; font-size: 26px; }
            h2 { color: #0f172a; margin-top: 30px; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
            .meta-table, .summary-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .meta-table td { padding: 10px; border: 1px solid #e2e8f0; font-size: 14px; }
            .meta-table td strong { color: #475569; }
            .summary-table th { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; }
            .summary-table td { border: 1px solid #e2e8f0; padding: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Attendance Summary Report</h1>
          <p style="color: #64748b; font-size: 13px; margin: 0 0 20px 0;">Generated on ${new Date().toLocaleDateString()}</p>
          
          <table class="meta-table">
            <tr>
              <td><strong>Report Month</strong></td>
              <td>${monthName} ${selectedYear}</td>
              <td><strong>Overall Attendance</strong></td>
              <td style="font-weight: bold; color: #047857;">${stats.percentage.toFixed(1)}%</td>
            </tr>
            <tr>
              <td><strong>Total Present</strong></td>
              <td>${stats.present} days</td>
              <td><strong>Total Absent</strong></td>
              <td>${stats.absent} days</td>
            </tr>
            <tr>
              <td><strong>Total Leaves</strong></td>
              <td>${stats.leave} days</td>
              <td><strong>Total Logs</strong></td>
              <td>${stats.total} days</td>
            </tr>
          </table>

          <h2>Workplace Performance Breakdown</h2>
          <table class="summary-table">
            <thead>
              <tr>
                <th>Workplace</th>
                <th style="text-align: right;">Attendance Rate</th>
                <th style="text-align: right;">Present Days</th>
                <th style="text-align: right;">Leave Days</th>
              </tr>
            </thead>
            <tbody>
              ${summaryRowsHtml || '<tr><td colspan="4" style="text-align: center;">No active workplaces found</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    triggerBanner('PDF Print opened.');
  };

  return (
    <div className="tab-content" role="region" aria-label="Workplace Attendance Reports" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECTION 1: MONTH & YEAR SELECTION */}
      <section className="action-card" style={{ marginBottom: 0, padding: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Report Period</h4>
        <div className="dropdown-flex-row">
          <CustomDropdown 
            value={selectedMonth} 
            onChange={setSelectedMonth}
            options={(selectedYear === currentYear ? monthNames.slice(0, currentMonth + 1) : monthNames).map((name, idx) => ({
              value: idx,
              label: name
            }))}
            ariaLabel="Select report month"
          />
          <CustomDropdown 
            value={selectedYear} 
            onChange={handleYearChange}
            options={years.map(y => ({
              value: y,
              label: String(y)
            }))}
            ariaLabel="Select report year"
          />
        </div>
      </section>

      {/* SECTION 2: EXPORT REPORTS */}
      <section className="action-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 0 }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>Export Reports</h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ flex: 1, padding: '12px', height: '48px', borderRadius: '16px', fontWeight: '700' }} onClick={exportCSV}>CSV</button>
          <button className="btn btn-primary" style={{ flex: 1, padding: '12px', height: '48px', borderRadius: '16px', fontWeight: '700' }} onClick={exportPDF}>PDF</button>
        </div>
      </section>

    </div>
  );
}
