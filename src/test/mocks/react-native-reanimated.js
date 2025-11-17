module.exports = {
  __esModule: true,
  default: {
    addWhitelistedNativeProps: () => {},
    createAnimatedComponent: (Component) => Component,
    Easing: {
      in: v => v,
      out: v => v,
      inOut: v => v,
      linear: v => v,
      ease: v => v,
    },
  },
  Easing: {
    in: v => v,
    out: v => v,
    inOut: v => v,
    linear: v => v,
    ease: v => v,
  },
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: (fn) => fn(),
  withTiming: (v) => v,
  withSpring: (v) => v,
};




