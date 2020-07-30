import * as L from 'leaflet'

declare module 'leaflet' {
    interface MarkerOptions {
        rotationAngle?: number; // Rotation angle, in degrees, clockwise. (Default = 0)
        rotationOrigin?: string; // The rotation center, as a transform-origin CSS rule. (Default = 'bottom center')
    }

    interface Marker {
        /*
        * Sets the rotation angle value.
        */
        setRotationAngle(newAngle: number): this;

        /**
         * Sets the rotation origin value.
         */
        setRotationOrigin(newOrigin: string): this;
    }

    namespace control {
        function slider(update: (sliderValue: number) => void, options: SliderOptions): Slider;
        interface SliderOptions {
          position?: ControlPosition
          id?: string
          max?: number
          value?: number
          step?: number
          size?: string
          orientation?: string
          logo?: string,
          syncSlider?: boolean
        }
        class Slider extends L.Control {
          constructor(options?: SliderOptions)
          state(stateName: string): Slider
        }
    
        function polylineMeasure(options: PolylineMeasureOptions): PolylineMeasure;
    
        interface PolylineMeasureOptions {
          id?: string,
          position?: string,
          unit?: string,
          clearMeasurementsOnStop?: boolean,
          showBearings?: boolean,
          showClearControl?: boolean,
          measureControlLabel?: string,
          bearingTextIn?: string,
          bearingTextOut?: string,
          measureControlTitleOn?: string,
          measureControlTitleOff?: string,
          clearControlTitle?: string
        }
    
        class PolylineMeasure extends L.Control {
          constructor(options?: PolylineMeasureOptions)
          state(stateName: string): PolylineMeasure
        }
      }

    namespace GeomanIO{
      interface DrawEnd{
        layer: L.Layer;
      }
    }
    
}



