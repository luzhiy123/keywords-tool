import XLSX from 'xlsx';

function parseExcel(file) {

    let reader = new FileReader();
    let promise = new Promise(function (resolve, reject) {
        try {
            reader.onload = function (e) {
                let wb = XLSX.read(e.target.result, {
                    type: 'binary'
                });
                let utils = XLSX.utils
                let data = wb.Sheets[wb.SheetNames[0]];
                let array = [];
                let xKey = {};
                for (let key in data) {
                    if (_.isObject(data[key])) {
                        let xMatch = key.match(/^[a-z|A-Z]+/gi)[0];
                        let xArray = xMatch.split('').reverse();
                        let xNumber = -1;
                        let yNumber = parseInt(key.match(/[0-9]+/gi)[0]) - 2;
                        xArray.forEach((val, index) => {
                            xNumber += (val.charCodeAt() - 64) * (index + 1);
                        })
                        if (yNumber === -1) {
                            xKey[xNumber] = data[key].v
                        } else {
                            if (!array[yNumber]) {
                                array[yNumber] = []
                            }
                            array[yNumber][xKey[xNumber]] = {
                                v: data[key].v.replace(/[\r\n]/g, ""),
                                c: data[key].c || []
                            };
                        }
                    }
                }
                resolve(array);
            };
        } catch (error) {
            reject('文件格式错误')
        }
    });
    reader.readAsBinaryString(file);
    return promise;
}


export default parseExcel;
