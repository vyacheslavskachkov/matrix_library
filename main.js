// Класс для работы с типизированными матрицами размером 4x4

class Matrix_4x4 {
    /**
     * Создаёт новую единичную матрицу
     * @returns {Float32Array} Новая типизированная матрица 4х4
     */
    static setIdentity() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1]);
    }

    /**
     * Создаёт новую матрицу ортогональной проекции
     * @param {number} left Расстояние до левого края плоскости отсечения
     * @param {number} right Расстояние до правого края плоскости отсечения
     * @param {number} top Расстояние до верхнего края плоскости отсечения
     * @param {number} bottom Расстояние до нижнего края плоскости отсечения
     * @param {number} near Расстояние от точки наблюдения до ближней плоскости отсечения
     * @param {number} far Расстояние от точки наблюдения до дальней плоскости отсечения
     * @returns {Float32Array} Новая типизированная матрица 4х4
     */
    static setOrtogonalProjection(left = -1, right = 1, top = 1, bottom = -1, near = 0, far = 1) {
        if (left == right || top == bottom || near == far)
            throw new Error('The visibility area is zero');
        let width = right - left,
            height = top - bottom,
            depth = far - near;
        return new Float32Array([
            2 / width, 0, 0, 0,
            0, 2 / height, 0, 0,
            0, 0, -2 / depth, 0,
            -(right + left) * width, -(top + bottom) * height, -(far + near) * depth, 1]);
    }

    /**
     * Создаёт новую матрицу перспективной проекции
     * @param {number} fov Угол обзора в градусах
     * @param {number} aspect Соотношение сторон ближней плоскости отсечения
     * @param {number} near Расстояние от точки наблюдения до ближней плоскости отсечения
     * @param {number} far Расстояние от точки наблюдения до дальней плоскости отсечения
     * @returns {Float32Array} Новая типизированная матрица 4х4
     */
    static setPerspectiveProjection(fov = (180 * (2 * Math.atan(window.innerHeight / 2 / window.innerHeight))) / Math.PI, aspect = 1, near = 1, far = 10) {
        if (fov <= 0 || near == far || aspect == 0)
            throw new Error('The visibility area is zero');
        if (near <= 0 || far <= 0)
            throw new Error('Distance to near or far point is less than zero');
        let angle = Math.PI * fov / 180 / 2,
            ctgAngle = Math.cos(angle) / Math.sin(angle),
            depthValue = 1 / (far - near);
        return new Float32Array([
            ctgAngle / aspect, 0, 0, 0,
            0, ctgAngle, 0, 0,
            0, 0, -(far + near) * depthValue, -1,
            0, 0, -2 * near * far * depthValue, 0]);
    }

    /**
     * Создаёт новую матрицу вида
     * @param {number} fromX Точка наблюдения по оси x
     * @param {number} fromY Точка наблюдения по оси y
     * @param {number} fromZ Точка наблюдения по оси z
     * @param {number} atX Точка направления взгляда по оси x
     * @param {number} atY Точка направления взгляда по оси y
     * @param {number} atZ Точка направления взгляда по оси z
     * @param {number} upX Направление вверх по оси x
     * @param {number} upY Направление вверх по оси y
     * @param {number} upZ Направление вверх по оси z
     * @returns {Float32Array} Новая типизированная матрица 4х4
     */
    static setView(fromX = 0, fromY = 0, fromZ = 0, atX = 0, atY = 0, atZ = -1, upX = 0, upY = 1, upZ = 0) {
        let x2 = atX - fromX,
            y2 = atY - fromY,
            z2 = atZ - fromZ,
            normalize = 1 / Math.hypot(x2, y2, z2),
            x0, y0, z0, x1, y1, z1;
        x2 *= normalize;
        y2 *= normalize;
        z2 *= normalize;
        x0 = y2 * upZ - z2 * upY;
        y0 = z2 * upX - x2 * upZ;
        z0 = x2 * upY - y2 * upX;
        normalize = 1 / Math.hypot(x0, y0, z0);
        x0 *= normalize;
        y0 *= normalize;
        z0 *= normalize;
        x1 = y0 * z2 - z0 * y2;
        y1 = z0 * x2 - x0 * z2;
        z1 = x0 * y2 - y0 * x2;
        return new Float32Array([
            x0, x1, -x2, 0,
            y0, y1, -y2, 0,
            z0, z1, -z2, 0,
            x0 * fromX + y0 * fromY + z0 * fromZ, x1 * fromX + y1 * fromY + z1 * fromZ, x2 * fromX + y2 * fromY + z2 * fromZ, 1]);
    }

    /**
     * Создаёт новую матрицу переноса
     * @param {number} x Координата переноса по оси x
     * @param {number} y Координата переноса по оси y
     * @param {number} z Координата переноса по оси z
     * @returns {Float32Array} Новая типизированная матрица 4х4
     */
    static setTranslate(x, y, z) {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1]);
    }

    /**
     * Создаёт новую матрицу вращения
     * @param {number} x Угол поворота в градусах по оси x
     * @param {number} y Угол поворота в градусах по оси y
     * @param {number} z Угол поворота в градусах по оси z
     * @returns {Float32Array} Новая типизированная матрица 4х4
     */
    static setRotate(x, y, z) {
        let mat = new Float32Array(16),
            temp, angle, sin, cos;
        if (x) {
            angle = Math.PI * x / 180;
            sin = Math.sin(angle);
            cos = Math.cos(angle);
            mat = [
                1, 0, 0, 0,
                0, cos, sin, 0,
                0, -sin, cos, 0,
                0, 0, 0, 1];
        }
        if (y) {
            angle = Math.PI * y / 180;
            sin = Math.sin(angle);
            cos = Math.cos(angle);
            temp = [
                cos, 0, -sin, 0,
                0, 1, 0, 0,
                sin, 0, cos, 0,
                0, 0, 0, 1];
            x ? mat = Matrix_4x4.multiply(mat, temp) : mat = temp;
        }
        if (z) {
            angle = Math.PI * z / 180;
            sin = Math.sin(angle);
            cos = Math.cos(angle);
            temp = [
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1];
            x || y ? mat = Matrix_4x4.multiply(mat, temp) : mat = temp;
        }
        return mat;
    }

    /**
     * Создаёт новую матрицу масщтабирования
     * @param {number} x Значение масштабирования по оси x
     * @param {number} y Значение масштабирования по оси y
     * @param {number} z Значение масштабирования по оси z
     * @returns {Float32Array} Новая типизированная матрица 4х4
     */
    static setScale(x, y, z) {
        return new Float32Array([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1]);
    }

    /**
     * Умножает матрицы друг на друга в порядке следования аргументов и возвращает новую матрицу
     * @param  {...Float32Array} matrix Принимает в качестве аргументов не менее двух матриц 4x4
     * @returns {Float32Array} Новая типизированная матрица 4х4
     */
    static multiply(...matrix) {
        if (matrix < 2)
            throw new console.error('Invalid number of arguments passed');
        let mat = new Float32Array(16);
        for (let n = 0; n < matrix.length - 1; n++) {
            for (let i = 0; i < 4; i++) {
                mat[i] = matrix[n][i] * matrix[n + 1][0] + matrix[n][i + 4] * matrix[n + 1][1] + matrix[n][i + 8] * matrix[n + 1][2] + matrix[n][i + 12] * matrix[n + 1][3];
                mat[i + 4] = matrix[n][i] * matrix[n + 1][4] + matrix[n][i + 4] * matrix[n + 1][5] + matrix[n][i + 8] * matrix[n + 1][6] + matrix[n][i + 12] * matrix[n + 1][7];
                mat[i + 8] = matrix[n][i] * matrix[n + 1][8] + matrix[n][i + 4] * matrix[n + 1][9] + matrix[n][i + 8] * matrix[n + 1][10] + matrix[n][i + 12] * matrix[n + 1][11];
                mat[i + 12] = matrix[n][i] * matrix[n + 1][12] + matrix[n][i + 4] * matrix[n + 1][13] + matrix[n][i + 8] * matrix[n + 1][14] + matrix[n][i + 12] * matrix[n + 1][15];
            }
            matrix[n + 1] = mat;
        }
        return mat;
    }
}
