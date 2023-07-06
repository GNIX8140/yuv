// YUV压缩分辨率
export const compressYUVArray = (yArray, uvArray, width, height) => {
    const compressedWidth = width / 3; // 图片宽度分辨率取值
    const compressedHeight = height / 3; // 图片高度分辨率取值
    const compressedYArray = new Uint8Array(compressedWidth * compressedHeight); // Y通道压缩数组
    const compressedUVArray = new Uint8Array(compressedWidth * compressedHeight / 2); // UV通道压缩数组
    // Y通道数据压缩
    let compressedYIndex = 0; // Y通道压缩索引
    for (let y = 0; y < height; y++) { // 逐行遍历
        let yIndex = y * width; // 二维索引，行数起始值
        for (let x = 0; x < width; x++) { // 逐列遍历
            compressedYArray[compressedYIndex] = yArray[yIndex + x]; // 取Y通道数据
            compressedYIndex++; // Y通道压缩索引自增
            if (x % 2 === 1) x += 4; // 奇数列跨越四列Y通道数据
        }
        if (y % 2 === 1) y += 4; // 奇数行跨越四行Y通道数据
    }
    // UV通道数据压缩
    let uvIndex = 0; // UV通道压缩索引
    for (let y = 0; y < height / 2; y += 3) { // UV通道跨越两行
        let yIndex = y * width; // 二维索引，行数起始值
        for (let x = 0; x < width; x += 6) { // UV通道跨越两列
            compressedUVArray[uvIndex] = uvArray[yIndex + x]; // 取U通道数据
            compressedUVArray[uvIndex + 1] = uvArray[yIndex + x + 1]; // 取V通道数据
            uvIndex += 2; // UV通道压缩索引自增
        }
    }
    return { // 返回压缩后的Y和UV通道数据
        yArray: compressedYArray,
        uvArray: compressedUVArray,
        width: compressedWidth,
        height: compressedHeight
    };
}

// YUV裁剪分辨率
export const cropYUVArray = (yArray, uvArray, width, height, cropWidth, cropHeight) => {
    const destWidth = width - cropWidth;
    const destHeight = height - cropHeight;
    const offsetXStart = cropWidth / 2;
    const offsetXEnd = width - (cropWidth / 2);
    const offsetYStart = cropHeight / 2;
    const offsetYEnd = height - (cropHeight / 2);
    const destYArray = new Uint8Array(destWidth * destHeight);
    const destUVArray = new Uint8Array(destWidth * destHeight / 2);
    let destYIndex = 0; // Y通道裁剪索引
    for (let y = offsetYStart; y < offsetYEnd; y++) {
        let yIndex = y * width;
        for (let x = offsetXStart; x < offsetXEnd; x++) {
            destYArray[destYIndex] = yArray[yIndex + x];
            destYIndex++;
        }
    }
    let destUVIndex = 0; // UV通道裁剪索引
    for (let y = offsetYStart / 2; y < (height - (cropHeight / 2)) / 2; y++) {
        let yIndex = y * width;
        for (let x = offsetXStart; x < offsetXEnd; x += 2) {
            destUVArray[destUVIndex] = uvArray[yIndex + x];
            destUVArray[destUVIndex + 1] = uvArray[yIndex + x + 1];
            destUVIndex += 2;
        }
    }
    return {
        yArray: destYArray,
        uvArray: destUVArray,
        width: destWidth,
        height: destHeight
    }
}

// YUV420转RGB数组
export const YUV420ToRGB = (yArray, uvArray, width, height) => {
    const rgbArray = new Array(width * height * 3); // 初始化RGB数组
    let yIndex = 0; // Y索引
    let uvIndex = 0; // UV索引
    let rgbIndex = 0; // RGB索引
    for (let j = 0; j < height; j++) { // 遍历二维数组高度
        for (let i = 0; i < width; i++) { // 遍历二维数组宽度
            const y = yArray[yIndex]; // 取Y通道值
            const u = uvArray[uvIndex]; // 取U通道值
            const v = uvArray[uvIndex + 1]; // 取V通道值
            const r = y + 1.402 * (v - 128); // R转换公式
            const g = y - 0.344136 * (u - 128) - 0.714136 * (v - 128); // G转换公式
            const b = y + 1.772 * (u - 128); // B转换公式
            rgbArray[rgbIndex] = Math.max(0, Math.min(255, r)); // 写入R
            rgbArray[rgbIndex + 1] = Math.max(0, Math.min(255, g)); // 写入G
            rgbArray[rgbIndex + 2] = Math.max(0, Math.min(255, b)); // 写入B
            yIndex++; // Y索引自增
            if (i % 2 === 1) uvIndex += 2; // UV交替存储 -> 每两列Y通道数据 UV索引自增一列
            rgbIndex += 3; // RGB存储一个像素点、自增
        }
        if (j % 2 === 1) uvIndex -= width; // 奇数行与上一偶数行Y通道共用UV值 -> 两行Y通道 UV索引自增一行 
    }
    return rgbArray;
}