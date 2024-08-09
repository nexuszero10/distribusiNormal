document.getElementById('hitung').addEventListener('click', () => {

    // container switch
    document.getElementById('summaryData').style.display = 'flex';
    document.getElementById('grafikNormal').style.display = 'flex';
    document.body.style.justifyContent = 'flex-start';

    // mendapatkan value data input
    var inputText = document.getElementById('data').value;
    var stringDataInput = inputText.split(',');
    var dataInput = [];
    for (let i = 0; i < stringDataInput.length; i++) {
        const value = parseFloat(stringDataInput[i].trim());
        if (!isNaN(value)) {
            dataInput.push(value);
        }
    }

    // menghitung rata-rata dataInput
    let sumDataInput = 0;
    for (let i = 0; i < dataInput.length; i++) {
        sumDataInput += dataInput[i];
    }
    var meanNormal = sumDataInput / dataInput.length;
    document.getElementById('meanNormal').textContent = meanNormal.toFixed(2);

    // menghitung standar deviasi dataInput
    let sumSquareDiff = 0;
    for (let i = 0; i < dataInput.length; i++) {
        sumSquareDiff += Math.pow(dataInput[i] - meanNormal, 2);
    }
    var varian = sumSquareDiff / dataInput.length;
    var standarDeviasiNormal = Math.sqrt(varian);
    document.getElementById('deviasiNormal').textContent = standarDeviasiNormal.toFixed(2);

    // generate bidang svg
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.getElementById('grafikNormal');
    svg.innerHTML = '';

    // generate sumbu x
    const sumbuX = document.createElementNS(svgNS, 'line');
    sumbuX.setAttribute('x1', '35');
    sumbuX.setAttribute('y1', '650');
    sumbuX.setAttribute('x2', '770');
    sumbuX.setAttribute('y2', '650');
    sumbuX.setAttribute('stroke', 'white'); // ganti warna sumbu x
    sumbuX.setAttribute('stroke-width', '2'); // ganti ketebalan sumbu x
    svg.appendChild(sumbuX);

    // menghitung nilai Probability Density Function (PDF)
    var pdfValue = [];
    for (let i = -3; i <= 3; i += 0.1) {
        const pdfDataValue = (1 / (Math.sqrt(2 * Math.PI))) * Math.exp(-((i) ** 2) / 2);
        pdfValue.push(pdfDataValue);
    }

    // menghitung peluang 
    var z1 = parseFloat(document.getElementById('z1').value);
    var z2 = parseFloat(document.getElementById('z2').value);
    var nilaiPeluang = peluang(z1, z2, 1000);
    document.getElementById('nilaiPeluang').textContent = nilaiPeluang.toFixed(5);

    // menyimpan value sumbu 'x' z1 dan z2
    xZ1 = 50 + ((z1 + 3) * 700) / 6;
    xZ2 = 50 + ((z2 + 3) * 700) / 6;

    const tolerance = 0.05;

    // menampilkan kurva
    const bellCurvePoints = [];
    for (let i = -3; i <= 3; i += 0.01) {
        const x = 50 + ((i + 3) * 700) / 6;
        const pdfDataValue = (1 / (Math.sqrt(2 * Math.PI))) * Math.exp(-((i) ** 2) / 2);
        const y = 650 - (pdfDataValue - Math.min(...pdfValue)) * (600 / (Math.max(...pdfValue) - Math.min(...pdfValue)));
        bellCurvePoints.push({ x, y });
    }

    const bellCurvePath = document.createElementNS(svgNS, 'path');
    let pathData = `M${bellCurvePoints[0].x},${bellCurvePoints[0].y}`;
    for (let i = 1; i < bellCurvePoints.length; i++) {
        pathData += `L${bellCurvePoints[i].x},${bellCurvePoints[i].y}`;
    }
    pathData += 'Z'; // Close the path
    bellCurvePath.setAttribute('d', pathData);
    bellCurvePath.setAttribute('fill', 'none');
    bellCurvePath.setAttribute('stroke', 'white');
    bellCurvePath.setAttribute('stroke-width', '2');
    svg.appendChild(bellCurvePath);

    // Create a tooltip div
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    for (let i = 0; i < dataInput.length; i++) {
        const zScore = (dataInput[i] - meanNormal) / standarDeviasiNormal;
        const x = 50 + ((zScore + 3) * 700) / 6;
        const pdfDataValue = (1 / (Math.sqrt(2 * Math.PI))) * Math.exp(-((zScore) ** 2) / 2);
        const y = 650 - (pdfDataValue - Math.min(...pdfValue)) * (600 / (Math.max(...pdfValue) - Math.min(...pdfValue)));

        // menampilkan garis vertikal dari circleBaku sampai sumbu x 
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y);
        line.setAttribute('x2', x);
        line.setAttribute('y2', 650);
        line.setAttribute('stroke-width', '3.55'); // ganti ketebalan garis

        // menentukan warna garis
        if (zScore >= z1 - tolerance && zScore <= z2 + tolerance) {
            line.setAttribute('stroke', 'rgb(3, 174, 210)'); // ganti warna garis yang masuk peluang
        } else {
            line.setAttribute('stroke', 'rgb(255, 154, 0)'); // ganti garis yang tidak masuk peluang
        }

        svg.appendChild(line);

        // menampilkan lingkaran perpotongan zScore dan PDF
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '5'); // ganti besar lingkaran
        circle.setAttribute('fill', 'rgb(249, 228, 0)'); // ganti warna lingkaran
        svg.appendChild(circle);

        // Add mouseover and mouseout events for tooltip
        circle.addEventListener('mouseover', function (event) {
            circle.style.cursor = 'pointer';
            tooltip.style.display = 'block';
            tooltip.textContent = `Z-Score: ${zScore.toFixed(2)}, Value: ${dataInput[i]}`;
        });

        circle.addEventListener('mousemove', function (event) {
            tooltip.style.left = event.pageX + 10 + 'px';
            tooltip.style.top = event.pageY - 20 + 'px';
        });

        circle.addEventListener('mouseout', function () {
            tooltip.style.display = 'none';
            circle.style.cursor = 'default';
        });

    }

    // menampilkan nilai zScore pada sumbu x
    for (let i = -3; i <= 3; i += 0.5) {
        var x = 50 + ((i + 3) * 700) / 6;
        var pdfDataValue = (1 / (Math.sqrt(2 * Math.PI))) * Math.exp(-((i) ** 2) / 2);
        var y = 650 - (pdfDataValue - Math.min(...pdfValue)) * (600 / (Math.max(...pdfValue) - Math.min(...pdfValue)));

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', '675');
        text.setAttribute('font-size', '12'); // ukuran nilai sumbu x
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('transform', `rotate(-45 ${x} 675)`);
        text.setAttribute('fill', 'white');
        text.textContent = i.toFixed(1);
        svg.appendChild(text);
    }
});

// fungsi unutk generate f(x) zScore
function generatePDFzScore(zScore) {
    return (1 / (Math.sqrt(2 * Math.PI))) * Math.exp(-((zScore) ** 2) / 2);
}

// fungsi menghitung integral
function peluang(z1, z2, n) {
    var h = (z2 - z1) / n;
    var sum = 0.5 * (generatePDFzScore(z1) + generatePDFzScore(z2));
    for (let i = 1; i < n; i++) {
        sum += generatePDFzScore(z1 + i * h);
    }
    return sum * h;
}

// fungsi reset button
document.getElementById('reset').addEventListener('click', () => {
    document.getElementById('data').value = '';
    document.getElementById('z1').value = '';
    document.getElementById('z2').value = '';
    document.getElementById('grafikNormal').innerHTML = '';
    document.getElementById('nilaiPeluang').textContent = '';
    document.getElementById('meanNormal').textContent = '';
    document.getElementById('deviasiNormal').textContent = '';
    document.body.style.justifyContent = 'center';
    document.getElementById('summaryData').style.display = 'none';
    document.getElementById('grafikNormal').style.display = 'none';
});

// focus blur input
const inputData = document.getElementById('data');

inputData.addEventListener('focus', () => {
    inputData.placeholder = '';
});

inputData.addEventListener('blur', () => {
    inputData.placeholder = 'input angka dengan pemisah koma (,)';
});

const inputZ1 = document.getElementById('z1');
inputZ1.addEventListener('focus', () => {
    inputZ1.placeholder = '';
});

inputZ1.addEventListener('blur', () => {
    inputZ1.placeholder = 'input z1';
});

const inputZ2 = document.getElementById('z2');
inputZ2.addEventListener('focus', () => {
    inputZ2.placeholder = '';
});

inputZ2.addEventListener('blur', () => {
    inputZ2.placeholder = 'input z2';
});