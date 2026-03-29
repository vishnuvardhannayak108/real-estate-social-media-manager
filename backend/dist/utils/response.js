export function ok(res, data, status = 200) {
    const body = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
    return res.status(status).json(body);
}
export function fail(res, code, message, status) {
    const body = {
        success: false,
        error: { code, message },
        timestamp: new Date().toISOString(),
    };
    return res.status(status).json(body);
}
