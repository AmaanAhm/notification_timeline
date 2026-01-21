const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

/**
 * Extract text from a single PDF
 */
async function parseSinglePdf(pdfPath) {
    const buffer = fs.readFileSync(pdfPath);
    const data = await pdf(buffer);

    return data.text
        .replace(/\r/g, ' ')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Parse all PDFs in a directory
 */
async function parseAllPdfs(pdfDir, outputDir) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));

    console.log(`📄 Found ${files.length} PDFs to parse`);

    for (let i = 0; i < files.length; i++) {
        const pdfFile = files[i];
        const pdfPath = path.join(pdfDir, pdfFile);
        const outputPath = path.join(
            outputDir,
            pdfFile.replace('.pdf', '.txt')
        );

        // Skip if already parsed
        if (fs.existsSync(outputPath)) {
            console.log(`⏭️  Skipping (already parsed): ${pdfFile}`);
            continue;
        }

        try {
            console.log(`🔍 Parsing [${i + 1}/${files.length}]: ${pdfFile}`);
            const text = await parseSinglePdf(pdfPath);
            fs.writeFileSync(outputPath, text, 'utf8');
            console.log(`✅ Parsed: ${pdfFile}`);
        } catch (err) {
            console.error(`❌ Failed to parse ${pdfFile}:`, err.message);
        }
    }
}

module.exports = {
    parseSinglePdf,
    parseAllPdfs
};
