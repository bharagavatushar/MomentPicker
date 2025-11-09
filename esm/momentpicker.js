// Loads the IIFE build for side effects, then re-exports the class.
import '../dist/momentpicker.min.js';

const MP = typeof window !== 'undefined' ? window.MomentPicker : undefined;
export default MP;
export { MP as MomentPicker };
