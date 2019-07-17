export const dispatchEvent = (env, type, params = {}) => {
    var event = new Event(type);
    for (var i in params) {
        event[i] = params[i];
    }
    env.dispatchEvent(event);
}