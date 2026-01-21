# Government Announcement Scraper v2.0

A robust Node.js application to monitor and scrape announcements from multiple government websites with intelligent SHA-256 hash-based change detection to avoid redundant downloads.

## 🌟 Features

- ✅ **Hash-Based Change Detection** - Uses SHA-256 to compare announcements and download only new content
- ✅ **Modular Architecture** - Clean separation of scrapers, utils, and configuration
- ✅ **Multi-Website Support** - Currently supports 3 websites, easily extensible to 28+
- ✅ **Smart Metadata Tracking** - Maintains JSON records with statistics and history
- ✅ **Duplicate Prevention** - Skips already downloaded files
- ✅ **Error Handling** - Graceful error handling for network issues
- ✅ **Progress Tracking** - Real-time console feedback with statistics

## 📁 Project Structure

```
notification-scraping/
├── src/
│   ├── index.js                 # Main entry point
│   ├── config.js                # Configuration for all websites
│   ├── scrapers/
│   │   ├── index.js             # Scraper exports
│   │   ├── dmeAssam.js          # DME Assam scraper
│   │   ├── apdhte.js            # APDHTE scraper
│   │   └── bcecebBihar.js       # BCECEB Bihar scraper
│   └── utils/
│       ├── hashManager.js       # SHA-256 hash comparison logic
│       ├── fileManager.js       # File operations & metadata
│       └── downloader.js        # PDF download logic
├── data/                        # Hash databases & metadata (gitignored)
│   ├── dme_assam/
│   │   ├── hashes.json         # Hash database
│   │   └── metadata.json       # Announcement metadata
│   ├── apdhte/
│   └── bceceb_bihar/
├── downloads/                   # Downloaded PDFs (gitignored)
│   ├── dme_assam/
│   ├── apdhte/
│   └── bceceb_bihar/
├── package.json
└── README.md
```

## 🚀 Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Run the scraper:**
```bash
npm start
```

## 📊 How It Works

### Hash-Based Change Detection

1. **First Run:**
   - Scrapes all announcements from websites
   - Generates SHA-256 hash for each (based on URL + title)
   - Saves hashes to `data/{website_id}/hashes.json`
   - Downloads all PDFs

2. **Subsequent Runs:**
   - Scrapes current announcements
   - Compares hashes with previous run
   - **Only downloads NEW announcements**
   - Updates hash database
   - Provides statistics (total, new, previous)

### Example Output

```
🚀 Government Announcement Scraper
📅 Started at: 11/21/2025, 10:30:00 AM
============================================================

============================================================
🌐 Processing: DME Assam
============================================================

🔍 Fetching page: https://dme.assam.gov.in/...
📊 Found 15 announcements

📈 Statistics:
   Total scraped: 15
   Previously seen: 12
   New announcements: 3

📥 Downloading 3 new PDFs...

[1/3] Processing: Admission Notice (after Stray round...)
  ✅ Downloaded: 2025-11-21_Admission_Notice_after_Stray_round....pdf

📊 Download Summary:
   ✅ Downloaded: 3
   ⏭️  Skipped: 0
   ❌ Failed: 0

💾 Updated hash database
📄 Saved metadata to: data/dme_assam/metadata.json
```

## 🌐 Supported Websites

| # | Website | Status | Downloads Folder |
|---|---------|--------|------------------|
| 1 | DME Assam | ✅ Active | `downloads/dme_assam/` |
| 2 | APDHTE | ✅ Active | `downloads/apdhte/` |
| 3 | BCECEB Bihar | ✅ Active | `downloads/bceceb_bihar/` |

## ⚙️ Configuration

Edit `src/config.js` to:
- Add new websites
- Enable/disable specific scrapers
- Adjust download delays
- Modify timeout settings

## 🔧 Adding New Websites

1. Create scraper in `src/scrapers/{website}.js`
2. Add to `src/scrapers/index.js`
3. Add configuration to `src/config.js`
4. Run scraper!

## 📦 Key Benefits of Hash Approach

- **Bandwidth Savings** - Only downloads new content
- **Time Efficiency** - Skips redundant processing
- **Data Integrity** - Detects even minor changes
- **Scalability** - Efficient for 28+ websites
- **History Tracking** - Maintains record of all announcements

## 🛠️ Future Enhancements

- [ ] Scheduled monitoring (cron/scheduler)
- [ ] PDF text extraction
- [ ] Database storage (SQLite/MongoDB)
- [ ] Email/webhook notifications
- [ ] Web dashboard for monitoring
- [ ] Add remaining 25 websites

## 📝 License

MIT
