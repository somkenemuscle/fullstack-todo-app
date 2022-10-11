//wrappng async func for try and catch
const catchAsync = function (fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}
module.exports = catchAsync;
