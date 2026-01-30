// ========================================
// EXCEL FILE HANDLING MODULE
// ========================================

const ExcelModule = {
    // Load Excel files from URLs
    loadExcelFiles: async function(callback) {
        try {
            console.log('Loading Excel files...');
            
            // Hardcoded URLs for master and destination files
            const masterFileUrl = 'http://trainingsampleapi.satva.solutions/uploads/CoA_Master.xlsx';
            const destinationFileUrl = 'http://trainingsampleapi.satva.solutions/uploads/CoA_Destination.xlsx';
            
            const masterData = await this.loadExcelFile(masterFileUrl);
            const destinationData = await this.loadExcelFile(destinationFileUrl);
            
            AppState.masterData = this.processMasterData(masterData);
            AppState.destinationData = this.processDestinationData(destinationData);
            
            console.log('✓ Excel files loaded successfully');
            console.log('Master Data:', AppState.masterData);
            console.log('Destination Data:', AppState.destinationData);
            
            if (callback) callback();
        } catch (error) {
            console.error('✗ Error loading Excel files:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Files',
                text: 'Could not load the Excel files. Please check the console for details.',
                confirmButtonColor: UI_CONFIG.confirmButtonColor
            });
        }
    },

    // Load a single Excel file
    loadExcelFile: async function(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            
            const worksheet = workbook.worksheets[0];
            const data = [];
            
            // Get headers from first row
            const headers = [];
            worksheet.getRow(1).eachCell((cell, colNumber) => {
                headers[colNumber - 1] = cell.value;
            });
            
            // Process data rows
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) { // Skip header row
                    const rowData = {};
                    row.eachCell((cell, colNumber) => {
                        const header = headers[colNumber - 1];
                        rowData[header] = cell.value;
                    });
                    data.push(rowData);
                }
            });
            
            return data;
        } catch (error) {
            console.error('Error loading Excel file:', url, error);
            throw error;
        }
    },

    // Process and filter master data
    processMasterData: function(data) {
        // Filter out:
        // 1. Rows without account numbers (these are headers/section titles)
        // 2. Rows where Number is not a number
        return data.filter(row => {
            return row.Number && typeof row.Number === 'number' && row.Number > 0;
        }).map(row => ({
            Id: row.Id || row.Code,
            Code: row.Code || row.Number,
            Name: row.Name || row.Description,
            Type: row.Type || '',
            AccountCategory: row.AccountCategory || 'Other'
        }));
    },

    // Process and filter destination data
    processDestinationData: function(data) {
        return data.map(row => ({
            Id: row.Id || row.Code,
            Code: row.Code || row.AccountCode,
            Name: row.Name || row.AccountName,
            Category: row.Category || row.AccountTypeName || 'Other',
            Type: row.Type || row.AccountTypeName || ''
        })).filter(row => row.Code); // Filter out any without account code
    }
};
