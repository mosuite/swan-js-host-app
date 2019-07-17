import {initProductLogEvents} from '../../../src/log/productLog';
import EventsEmitter from '../../utils/event-emitter';
import {swaninterface} from '../../mock/swan-api';

const logEventsCommunicator = new EventsEmitter();

describe('initProductLogEvents', () => {

    it('should initProductLogEvents is a function', done => {
        expect(initProductLogEvents).toEqual(jasmine.any(Function));
        done();
    });

    it('initProductLogEvents', done => {
        const res = initProductLogEvents(logEventsCommunicator, swaninterface);
        expect(res).toBeUndefined();
        done();
    });

    it('should be return while the fireMessage event params does not exist', done => {
        initProductLogEvents(logEventsCommunicator, swaninterface);
        logEventsCommunicator.fireMessage({
            type: 'ApplifeCycle'
        });

        done();
    });
});