import XLSX from 'js-xlsx';

function parseExcel(file) {

    let reader = new FileReader();
    let promise = new Promise(function (resolve, reject) {
        try {
            reader.onload = function (e) {
                let wb = XLSX.read(e.target.result, {
                    type: 'binary'
                });
                resolve(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
            };
        } catch (error) {
            reject('文件格式错误')
        }
    });
    reader.readAsBinaryString(file);
    return promise;
}


export default parseExcel;
