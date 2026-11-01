(function() {
  "use strict";
  const DEV = false;
  var is_array = Array.isArray;
  var index_of = Array.prototype.indexOf;
  var includes = Array.prototype.includes;
  var array_from = Array.from;
  var define_property = Object.defineProperty;
  var get_descriptor = Object.getOwnPropertyDescriptor;
  var get_descriptors = Object.getOwnPropertyDescriptors;
  var object_prototype = Object.prototype;
  var array_prototype = Array.prototype;
  var get_prototype_of = Object.getPrototypeOf;
  var is_extensible = Object.isExtensible;
  const noop = () => {
  };
  function run(fn) {
    return fn();
  }
  function run_all(arr) {
    for (var i = 0; i < arr.length; i++) {
      arr[i]();
    }
  }
  function deferred() {
    var resolve;
    var reject;
    var promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }
  const DERIVED = 1 << 1;
  const EFFECT = 1 << 2;
  const RENDER_EFFECT = 1 << 3;
  const MANAGED_EFFECT = 1 << 24;
  const BLOCK_EFFECT = 1 << 4;
  const BRANCH_EFFECT = 1 << 5;
  const ROOT_EFFECT = 1 << 6;
  const BOUNDARY_EFFECT = 1 << 7;
  const PAUSED = 1 << 8;
  const CONNECTED = 1 << 9;
  const CLEAN = 1 << 10;
  const DIRTY = 1 << 11;
  const MAYBE_DIRTY = 1 << 12;
  const INERT = 1 << 13;
  const DESTROYED = 1 << 14;
  const REACTION_RAN = 1 << 15;
  const DESTROYING = 1 << 25;
  const EFFECT_TRANSPARENT = 1 << 16;
  const EAGER_EFFECT = 1 << 17;
  const HEAD_EFFECT = 1 << 18;
  const EFFECT_PRESERVED = 1 << 19;
  const USER_EFFECT = 1 << 20;
  const EFFECT_OFFSCREEN = 1 << 25;
  const REACTION_IS_UPDATING = 1 << 21;
  const ASYNC = 1 << 22;
  const ERROR_VALUE = 1 << 23;
  const STATE_SYMBOL = /* @__PURE__ */ Symbol("$state");
  const COMPONENT_SYMBOL = /* @__PURE__ */ Symbol("component");
  const LEGACY_PROPS = /* @__PURE__ */ Symbol("legacy props");
  const LOADING_ATTR_SYMBOL = /* @__PURE__ */ Symbol("");
  const ATTRIBUTES_CACHE = /* @__PURE__ */ Symbol("attributes");
  const CLASS_CACHE = /* @__PURE__ */ Symbol("class");
  const STYLE_CACHE = /* @__PURE__ */ Symbol("style");
  const TEXT_CACHE = /* @__PURE__ */ Symbol("text");
  const FORM_RESET_HANDLER = /* @__PURE__ */ Symbol("form reset");
  const STALE_REACTION = new class StaleReactionError extends Error {
    name = "StaleReactionError";
    message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
  }();
  const IS_XHTML = (
    // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
    !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
  );
  const EACH_ITEM_REACTIVE = 1;
  const EACH_INDEX_REACTIVE = 1 << 1;
  const EACH_IS_CONTROLLED = 1 << 2;
  const EACH_IS_ANIMATED = 1 << 3;
  const EACH_ITEM_IMMUTABLE = 1 << 4;
  const PROPS_IS_IMMUTABLE = 1;
  const PROPS_IS_RUNES = 1 << 1;
  const PROPS_IS_UPDATED = 1 << 2;
  const PROPS_IS_BINDABLE = 1 << 3;
  const PROPS_IS_LAZY_INITIAL = 1 << 4;
  const TEMPLATE_FRAGMENT = 1;
  const TEMPLATE_USE_IMPORT_NODE = 1 << 1;
  const HYDRATION_ERROR = {};
  const UNINITIALIZED = /* @__PURE__ */ Symbol("uninitialized");
  const NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
  function derived_inert() {
    {
      console.warn(`https://svelte.dev/e/derived_inert`);
    }
  }
  function select_multiple_invalid_value() {
    {
      console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
    }
  }
  function svelte_boundary_reset_noop() {
    {
      console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
    }
  }
  function equals(value) {
    return value === this.v;
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
  }
  function safe_equals(value) {
    return !safe_not_equal(value, this.v);
  }
  function lifecycle_outside_component(name) {
    {
      throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
    }
  }
  function async_derived_orphan() {
    {
      throw new Error(`https://svelte.dev/e/async_derived_orphan`);
    }
  }
  function each_key_duplicate(a, b, value) {
    {
      throw new Error(`https://svelte.dev/e/each_key_duplicate`);
    }
  }
  function effect_in_teardown(rune) {
    {
      throw new Error(`https://svelte.dev/e/effect_in_teardown`);
    }
  }
  function effect_in_unowned_derived() {
    {
      throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
    }
  }
  function effect_orphan(rune) {
    {
      throw new Error(`https://svelte.dev/e/effect_orphan`);
    }
  }
  function effect_update_depth_exceeded() {
    {
      throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
    }
  }
  function props_invalid_value(key) {
    {
      throw new Error(`https://svelte.dev/e/props_invalid_value`);
    }
  }
  function state_descriptors_fixed() {
    {
      throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
    }
  }
  function state_prototype_fixed() {
    {
      throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
    }
  }
  function state_unsafe_mutation() {
    {
      throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
    }
  }
  function svelte_boundary_reset_onerror() {
    {
      throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
    }
  }
  let legacy_mode_flag = false;
  let tracing_mode_flag = false;
  function enable_legacy_mode_flag() {
    legacy_mode_flag = true;
  }
  let component_context = null;
  function set_component_context(context) {
    component_context = context;
  }
  function push(props, runes = false, fn) {
    component_context = {
      p: component_context,
      i: false,
      c: null,
      e: null,
      s: props,
      x: null,
      r: (
        /** @type {Effect} */
        active_effect
      ),
      l: legacy_mode_flag && !runes ? { s: null, u: null, $: [] } : null
    };
  }
  function pop(component) {
    var context = (
      /** @type {ComponentContext} */
      component_context
    );
    var effects = context.e;
    if (effects !== null) {
      context.e = null;
      for (var fn of effects) {
        create_user_effect(fn);
      }
    }
    context.i = true;
    component_context = context.p;
    return mark_as_component(component);
  }
  function mark_as_component(component = {}) {
    define_property(component, COMPONENT_SYMBOL, { value: true });
    return component;
  }
  function is_runes() {
    return !legacy_mode_flag || component_context !== null && component_context.l === null;
  }
  let micro_tasks = [];
  function run_micro_tasks() {
    var tasks = micro_tasks;
    micro_tasks = [];
    run_all(tasks);
  }
  function queue_micro_task(fn) {
    if (micro_tasks.length === 0 && !is_flushing_sync) {
      var tasks = micro_tasks;
      queueMicrotask(() => {
        if (tasks === micro_tasks) run_micro_tasks();
      });
    }
    micro_tasks.push(fn);
  }
  function flush_tasks() {
    while (micro_tasks.length > 0) {
      run_micro_tasks();
    }
  }
  const STATUS_MASK = -7169;
  function set_signal_status(signal, status) {
    signal.f = signal.f & STATUS_MASK | status;
  }
  function update_derived_status(derived2) {
    if ((derived2.f & CONNECTED) !== 0 || derived2.deps === null) {
      set_signal_status(derived2, CLEAN);
    } else {
      set_signal_status(derived2, MAYBE_DIRTY);
    }
  }
  function defer_effect(effect2, dirty_effects, maybe_dirty_effects) {
    if ((effect2.f & DIRTY) !== 0) {
      dirty_effects.add(effect2);
    } else if ((effect2.f & MAYBE_DIRTY) !== 0) {
      maybe_dirty_effects.add(effect2);
    }
    set_signal_status(effect2, CLEAN);
  }
  let listening_to_form_reset = false;
  function add_form_reset_listener() {
    if (!listening_to_form_reset) {
      listening_to_form_reset = true;
      document.addEventListener(
        "reset",
        (evt) => {
          Promise.resolve().then(() => {
            if (!evt.defaultPrevented) {
              for (
                const e of
                /**@type {HTMLFormElement} */
                evt.target.elements
              ) {
                e[FORM_RESET_HANDLER]?.();
              }
            }
          });
        },
        // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
        { capture: true }
      );
    }
  }
  function without_reactive_context(fn) {
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      return fn();
    } finally {
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }
  function listen_to_event_and_reset_event(element, event2, handler, on_reset = handler) {
    element.addEventListener(event2, () => without_reactive_context(handler));
    const prev = (
      /** @type {any} */
      element[FORM_RESET_HANDLER]
    );
    if (prev) {
      element[FORM_RESET_HANDLER] = () => {
        prev();
        on_reset(true);
      };
    } else {
      element[FORM_RESET_HANDLER] = () => on_reset(true);
    }
    add_form_reset_listener();
  }
  function flatten(blockers, sync, async, fn) {
    const d = is_runes() ? derived : derived_safe_equal;
    var pending = blockers.filter((b) => !b.settled);
    var deriveds = sync.map(d);
    if (async.length === 0 && pending.length === 0) {
      fn(deriveds);
      return;
    }
    var parent = (
      /** @type {Effect} */
      active_effect
    );
    var restore = capture();
    var blocker_promise = pending.length === 1 ? pending[0].promise : pending.length > 1 ? Promise.all(pending.map((b) => b.promise)) : null;
    function finish(async2) {
      if ((parent.f & DESTROYED) !== 0) {
        return;
      }
      restore();
      try {
        fn([...deriveds, ...async2]);
      } catch (error) {
        invoke_error_boundary(error, parent);
      }
      unset_context();
    }
    var decrement_pending = increment_pending();
    if (async.length === 0) {
      blocker_promise.then(() => finish([])).finally(decrement_pending);
      return;
    }
    function run2() {
      Promise.all(async.map((expression) => /* @__PURE__ */ async_derived(expression))).then(finish).catch((error) => invoke_error_boundary(error, parent)).finally(decrement_pending);
    }
    if (blocker_promise) {
      blocker_promise.then(() => {
        if ((parent.f & DESTROYED) !== 0) {
          decrement_pending();
          return;
        }
        restore();
        run2();
        unset_context();
      });
    } else {
      run2();
    }
  }
  function capture() {
    var previous_effect = (
      /** @type {Effect} */
      active_effect
    );
    var previous_reaction = active_reaction;
    var previous_component_context = component_context;
    var previous_batch2 = (
      /** @type {Batch} */
      current_batch
    );
    return function restore(activate_batch = true) {
      set_active_effect(previous_effect);
      set_active_reaction(previous_reaction);
      set_component_context(previous_component_context);
      if (activate_batch && (previous_effect.f & DESTROYED) === 0) {
        previous_batch2?.activate();
        previous_batch2?.apply();
      }
    };
  }
  function unset_context(deactivate_batch = true) {
    set_active_effect(null);
    set_active_reaction(null);
    set_component_context(null);
    if (deactivate_batch) current_batch?.deactivate();
  }
  function increment_pending() {
    var effect2 = (
      /** @type {Effect} */
      active_effect
    );
    var boundary2 = effect2.b;
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var blocking = !!boundary2?.is_rendered();
    boundary2?.update_pending_count(1, batch);
    batch.increment(blocking, effect2);
    return () => {
      boundary2?.update_pending_count(-1, batch);
      batch.decrement(blocking, effect2);
    };
  }
  // @__NO_SIDE_EFFECTS__
  function derived(fn) {
    var flags2 = DERIVED | DIRTY;
    if (active_effect !== null) {
      active_effect.f |= EFFECT_PRESERVED;
    }
    const signal = {
      ctx: component_context,
      deps: null,
      effects: null,
      equals,
      f: flags2,
      fn,
      reactions: null,
      rv: 0,
      v: (
        /** @type {V} */
        UNINITIALIZED
      ),
      wv: 0,
      parent: active_effect,
      ac: null
    };
    return signal;
  }
  const OBSOLETE = /* @__PURE__ */ Symbol("obsolete");
  // @__NO_SIDE_EFFECTS__
  function async_derived(fn, label, location) {
    let parent = (
      /** @type {Effect | null} */
      active_effect
    );
    if (parent === null) {
      async_derived_orphan();
    }
    var promise = (
      /** @type {Promise<V>} */
      /** @type {unknown} */
      void 0
    );
    var signal = source(
      /** @type {V} */
      UNINITIALIZED
    );
    var should_suspend = !active_reaction;
    var deferreds = /* @__PURE__ */ new Set();
    async_effect(() => {
      var effect2 = (
        /** @type {Effect} */
        active_effect
      );
      var d = deferred();
      promise = d.promise;
      try {
        Promise.resolve(fn()).then(d.resolve, (e) => {
          if (e !== STALE_REACTION) d.reject(e);
        }).finally(unset_context);
      } catch (error) {
        d.reject(error);
        unset_context();
      }
      var batch = (
        /** @type {Batch} */
        current_batch
      );
      if (should_suspend) {
        if ((effect2.f & REACTION_RAN) !== 0) {
          var decrement_pending = increment_pending();
        }
        if (
          // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
          parent.b?.is_rendered()
        ) {
          batch.async_deriveds.get(effect2)?.reject(OBSOLETE);
        } else {
          for (const d2 of deferreds.values()) {
            d2.reject(OBSOLETE);
          }
        }
        deferreds.add(d);
        batch.async_deriveds.set(effect2, d);
      }
      const handler = (value, error = void 0) => {
        decrement_pending?.();
        deferreds.delete(d);
        if (error === OBSOLETE) return;
        batch.activate();
        if (error) {
          signal.f |= ERROR_VALUE;
          internal_set(signal, error);
        } else {
          if ((signal.f & ERROR_VALUE) !== 0) {
            signal.f ^= ERROR_VALUE;
          }
          internal_set(signal, value);
        }
        batch.deactivate();
      };
      d.promise.then(handler, (e) => handler(null, e || "unknown"));
    });
    teardown(() => {
      for (const d of deferreds) {
        d.reject(OBSOLETE);
      }
    });
    return new Promise((fulfil) => {
      function next(p) {
        function go() {
          if (p === promise) {
            fulfil(signal);
          } else {
            next(promise);
          }
        }
        p.then(go, go);
      }
      next(promise);
    });
  }
  // @__NO_SIDE_EFFECTS__
  function user_derived(fn) {
    const d = /* @__PURE__ */ derived(fn);
    push_reaction_value(d);
    return d;
  }
  // @__NO_SIDE_EFFECTS__
  function derived_safe_equal(fn) {
    const signal = /* @__PURE__ */ derived(fn);
    signal.equals = safe_equals;
    return signal;
  }
  function destroy_derived_effects(derived2) {
    var effects = derived2.effects;
    if (effects !== null) {
      derived2.effects = null;
      for (var i = 0; i < effects.length; i += 1) {
        destroy_effect(
          /** @type {Effect} */
          effects[i]
        );
      }
    }
  }
  function execute_derived(derived2) {
    var value;
    var prev_active_effect = active_effect;
    var parent = derived2.parent;
    if (!is_destroying_effect && parent !== null && derived2.v !== UNINITIALIZED && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
    (parent.f & (DESTROYED | INERT)) !== 0) {
      derived_inert();
      return derived2.v;
    }
    set_active_effect(parent);
    {
      try {
        destroy_derived_effects(derived2);
        value = update_reaction(derived2);
      } finally {
        set_active_effect(prev_active_effect);
      }
    }
    return value;
  }
  function update_derived(derived2) {
    var value = execute_derived(derived2);
    if (!derived2.equals(value)) {
      derived2.wv = increment_write_version();
      if (!current_batch?.is_fork || derived2.deps === null) {
        if (current_batch !== null) {
          current_batch.capture(derived2, value, true);
          previous_batch?.capture(derived2, value, true);
        } else {
          derived2.v = value;
        }
        if (derived2.deps === null) {
          set_signal_status(derived2, CLEAN);
          return;
        }
      }
    }
    if (is_destroying_effect) {
      return;
    }
    if (batch_values !== null) {
      if (effect_tracking() || current_batch?.is_fork) {
        batch_values.set(derived2, value);
      }
    } else {
      update_derived_status(derived2);
    }
  }
  function freeze_derived_effects(derived2) {
    if (derived2.effects === null) return;
    for (const e of derived2.effects) {
      if (e.teardown || e.ac) {
        e.teardown?.();
        if (e.ac !== null) {
          without_reactive_context(() => {
            e.ac.abort(STALE_REACTION);
            e.ac = null;
          });
        }
        if (e.fn !== null) e.teardown = noop;
        remove_reactions(e, 0);
        destroy_effect_children(e);
      }
    }
  }
  function unfreeze_derived_effects(derived2) {
    if (derived2.effects === null) return;
    for (const e of derived2.effects) {
      if (e.teardown && e.fn !== null) {
        update_effect(e);
      }
    }
  }
  let first_batch = null;
  let last_batch = null;
  let current_batch = null;
  let previous_batch = null;
  let batch_values = null;
  let last_scheduled_effect = null;
  let is_flushing_sync = false;
  let is_processing = false;
  let collected_effects = null;
  let legacy_updates = null;
  var flush_count = 0;
  var source_stacks = /* @__PURE__ */ new Set();
  let uid = 1;
  class Batch {
    id = uid++;
    /** True as soon as `#process` was called */
    #started = false;
    linked = true;
    /** @type {Batch | null} */
    #prev = null;
    /** @type {Batch | null} */
    #next = null;
    /** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
    async_deriveds = /* @__PURE__ */ new Map();
    /**
     * The current values of any signals that are updated in this batch.
     * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Value, [any, boolean]>}
     */
    current = /* @__PURE__ */ new Map();
    /**
     * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Value, any>}
     */
    previous = /* @__PURE__ */ new Map();
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<(batch: Batch) => void>}
     */
    #commit_callbacks = /* @__PURE__ */ new Set();
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    #discard_callbacks = /* @__PURE__ */ new Set();
    /**
     * The number of async effects that are currently in flight
     */
    #pending = 0;
    /**
     * Async effects that are currently in flight, _not_ inside a pending boundary
     * @type {Map<Effect, number>}
     */
    #blocking_pending = /* @__PURE__ */ new Map();
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    #deferred = null;
    /**
     * Effects that were scheduled in this batch but not yet 'resolved' into the
     * root effects that need to be flushed. Resolving — the upwards traversal that
     * marks the path to each effect on the shared effect tree (see #resolve) — is
     * deferred until the batch is processed, so that the markers are created and
     * consumed within a single traversal. Scheduling into other batches (which can
     * happen concurrently, e.g. while a batch is committed) can therefore never
     * observe (and be confused by) this batch's markers.
     * May contain duplicates — deduplication happens during resolving
     * @type {Effect[]}
     */
    #scheduled = [];
    /**
     * Effects created while this batch was active.
     * @type {Effect[]}
     */
    #new_effects = [];
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    #dirty_effects = /* @__PURE__ */ new Set();
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    #maybe_dirty_effects = /* @__PURE__ */ new Set();
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    #skipped_branches = /* @__PURE__ */ new Map();
    /**
     * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
     * @type {Set<Effect>}
     */
    #unskipped_branches = /* @__PURE__ */ new Set();
    is_fork = false;
    #decrement_queued = false;
    constructor() {
      if (last_batch === null) {
        first_batch = last_batch = this;
      } else {
        last_batch.#next = this;
        this.#prev = last_batch;
      }
      last_batch = this;
    }
    #is_deferred() {
      if (this.is_fork) return true;
      for (const effect2 of this.#blocking_pending.keys()) {
        var e = effect2;
        var skipped = false;
        while (e.parent !== null) {
          if (this.#skipped_branches.has(e)) {
            skipped = true;
            break;
          }
          e = e.parent;
        }
        if (!skipped) {
          return true;
        }
      }
      return false;
    }
    /**
     * Add an effect to the #skipped_branches map and reset its children
     * @param {Effect} effect
     */
    skip_effect(effect2) {
      if (!this.#skipped_branches.has(effect2)) {
        this.#skipped_branches.set(effect2, { d: [], m: [] });
      }
      this.#unskipped_branches.delete(effect2);
    }
    /**
     * Remove an effect from the #skipped_branches map and reschedule
     * any tracked dirty/maybe_dirty child effects
     * @param {Effect} effect
     * @param {(e: Effect) => void} callback
     */
    unskip_effect(effect2, callback = (e) => this.schedule(e)) {
      var tracked = this.#skipped_branches.get(effect2);
      if (tracked) {
        this.#skipped_branches.delete(effect2);
        for (var e of tracked.d) {
          set_signal_status(e, DIRTY);
          callback(e);
        }
        for (e of tracked.m) {
          set_signal_status(e, MAYBE_DIRTY);
          callback(e);
        }
      }
      this.#unskipped_branches.add(effect2);
    }
    /**
     * Convert the effects that were scheduled in this batch into the root effects
     * that need to be traversed, marking the path to each effect (by clearing the
     * `CLEAN` flag on ancestor branches) so that the traversal can find them.
     * This happens right before traversal rather than at scheduling time, so that
     * the markers left on the (shared) effect tree are created and consumed within
     * a single traversal — scheduling into other batches can never observe them
     * @returns {Effect[]}
     */
    #resolve() {
      var roots = [];
      for (const effect2 of this.#scheduled) {
        if ((effect2.f & DESTROYED) !== 0 || (effect2.f & (DIRTY | MAYBE_DIRTY)) === 0) continue;
        var e = effect2;
        var covered = false;
        while (e.parent !== null) {
          e = e.parent;
          var flags2 = e.f;
          if ((flags2 & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
            if ((flags2 & CLEAN) === 0) {
              covered = true;
              break;
            }
            e.f ^= CLEAN;
          }
        }
        if (!covered) {
          roots.push(e);
        }
      }
      this.#scheduled = [];
      return roots;
    }
    #process() {
      this.#started = true;
      for (const e of this.#dirty_effects) {
        this.#maybe_dirty_effects.delete(e);
        set_signal_status(e, DIRTY);
        this.schedule(e);
      }
      for (const e of this.#maybe_dirty_effects) {
        set_signal_status(e, MAYBE_DIRTY);
        this.schedule(e);
      }
      this.apply();
      var effects = collected_effects = [];
      var render_effects = [];
      var updates = legacy_updates = [];
      while (this.#scheduled.length > 0) {
        if (flush_count++ > 1e3) {
          this.#unlink();
          infinite_loop_guard();
        }
        for (const root2 of this.#resolve()) {
          try {
            this.#traverse(root2, effects, render_effects);
          } catch (e) {
            reset_all(root2);
            if (!this.#is_deferred()) this.discard();
            throw e;
          }
        }
      }
      current_batch = null;
      if (updates.length > 0) {
        var batch = Batch.ensure();
        for (const e of updates) {
          batch.schedule(e);
        }
      }
      collected_effects = null;
      legacy_updates = null;
      if (this.#is_deferred()) {
        this.#defer_effects(render_effects);
        this.#defer_effects(effects);
        for (const [e, t] of this.#skipped_branches) {
          reset_branch(e, t);
        }
        if (updates.length > 0) {
          /** @type {unknown} */
          current_batch.#process();
        }
        return;
      }
      const earlier_batch = this.#find_earlier_batch();
      if (earlier_batch) {
        this.#defer_effects(render_effects);
        this.#defer_effects(effects);
        earlier_batch.#merge(this);
        return;
      }
      this.#dirty_effects.clear();
      this.#maybe_dirty_effects.clear();
      for (const fn of this.#commit_callbacks) fn(this);
      this.#commit_callbacks.clear();
      previous_batch = this;
      flush_queued_effects(render_effects);
      flush_queued_effects(effects);
      previous_batch = null;
      this.#deferred?.resolve();
      var next_batch = (
        /** @type {Batch | null} */
        /** @type {unknown} */
        current_batch
      );
      if (this.#pending === 0 && (this.#scheduled.length === 0 || next_batch !== null)) {
        this.#unlink();
      }
      if (this.#scheduled.length > 0) {
        if (next_batch !== null) {
          for (const e of this.#scheduled) {
            next_batch.#scheduled.push(e);
          }
          this.#scheduled = [];
        } else {
          next_batch = this;
        }
      }
      if (next_batch !== null) {
        old_values.clear();
        next_batch.#process();
      }
    }
    /**
     * Traverse the effect tree, executing effects or stashing
     * them for later execution as appropriate
     * @param {Effect} root
     * @param {Effect[]} effects
     * @param {Effect[]} render_effects
     */
    #traverse(root2, effects, render_effects) {
      root2.f ^= CLEAN;
      var effect2 = root2.first;
      while (effect2 !== null) {
        var flags2 = effect2.f;
        var is_branch = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
        var is_skippable_branch = is_branch && (flags2 & CLEAN) !== 0;
        var skip = is_skippable_branch || (flags2 & INERT) !== 0 || this.#skipped_branches.has(effect2);
        if (!skip && effect2.fn !== null) {
          if (is_branch) {
            effect2.f ^= CLEAN;
          } else if ((flags2 & EFFECT) !== 0) {
            effects.push(effect2);
          } else if (is_dirty(effect2)) {
            if ((flags2 & BLOCK_EFFECT) !== 0) this.#maybe_dirty_effects.add(effect2);
            update_effect(effect2);
          }
          var child2 = effect2.first;
          if (child2 !== null) {
            effect2 = child2;
            continue;
          }
        }
        while (effect2 !== null) {
          var next = effect2.next;
          if (next !== null) {
            effect2 = next;
            break;
          }
          effect2 = effect2.parent;
        }
      }
    }
    #find_earlier_batch() {
      var batch = this.#prev;
      while (batch !== null) {
        if (!batch.is_fork) {
          for (const [value, [, is_derived]] of this.current) {
            if (batch.current.has(value) && !is_derived) {
              return batch;
            }
          }
        }
        batch = batch.#prev;
      }
      return null;
    }
    /**
     * @param {Batch} batch
     */
    #merge(batch) {
      for (const [source2, value] of batch.current) {
        if (!this.previous.has(source2) && batch.previous.has(source2)) {
          this.previous.set(source2, batch.previous.get(source2));
        }
        this.current.set(source2, value);
      }
      for (const [effect2, deferred2] of batch.async_deriveds) {
        const d = this.async_deriveds.get(effect2);
        if (d) deferred2.promise.then(d.resolve).catch(d.reject);
      }
      batch.async_deriveds.clear();
      this.transfer_effects(batch.#dirty_effects, batch.#maybe_dirty_effects);
      const mark = (value) => {
        var reactions = value.reactions;
        if (reactions === null) return;
        if ((value.f & DERIVED) !== 0 && (value.f & (DIRTY | MAYBE_DIRTY)) === 0) {
          return;
        }
        for (const reaction of reactions) {
          var flags2 = reaction.f;
          if ((flags2 & DERIVED) !== 0) {
            mark(
              /** @type {Derived} */
              reaction
            );
          } else {
            var effect2 = (
              /** @type {Effect} */
              reaction
            );
            if (flags2 & (ASYNC | BLOCK_EFFECT) && !this.async_deriveds.has(effect2)) {
              this.#maybe_dirty_effects.delete(effect2);
              set_signal_status(effect2, DIRTY);
              this.schedule(effect2);
            }
          }
        }
      };
      for (const source2 of this.current.keys()) {
        mark(source2);
      }
      this.oncommit(() => batch.discard());
      batch.#unlink();
      current_batch = this;
      this.#process();
    }
    /**
     * @param {Effect[]} effects
     */
    #defer_effects(effects) {
      for (var i = 0; i < effects.length; i += 1) {
        defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
      }
    }
    /**
     * Associate a change to a given source with the current
     * batch, noting its previous and current values
     * @param {Value} source
     * @param {any} value
     * @param {boolean} [is_derived]
     */
    capture(source2, value, is_derived = false) {
      if (source2.v !== UNINITIALIZED && !this.previous.has(source2)) {
        this.previous.set(source2, source2.v);
      }
      if ((source2.f & ERROR_VALUE) === 0) {
        this.current.set(source2, [value, is_derived]);
        batch_values?.set(source2, value);
      }
      if (!this.is_fork) {
        source2.v = value;
      }
    }
    activate() {
      current_batch = this;
    }
    deactivate() {
      current_batch = null;
      batch_values = null;
    }
    flush() {
      try {
        if (DEV) ;
        is_processing = true;
        current_batch = this;
        this.#process();
      } finally {
        flush_count = 0;
        last_scheduled_effect = null;
        collected_effects = null;
        legacy_updates = null;
        is_processing = false;
        current_batch = null;
        batch_values = null;
        old_values.clear();
      }
    }
    discard() {
      for (const fn of this.#discard_callbacks) fn(this);
      this.#discard_callbacks.clear();
      for (const deferred2 of this.async_deriveds.values()) {
        deferred2.reject(OBSOLETE);
      }
      this.#unlink();
      this.#deferred?.resolve();
    }
    /**
     * @param {Effect} effect
     */
    register_created_effect(effect2) {
      this.#new_effects.push(effect2);
    }
    #commit() {
      for (let batch = first_batch; batch !== null; batch = batch.#next) {
        var is_earlier = batch.id < this.id;
        var sources = [];
        for (const [source3, [value, is_derived]] of this.current) {
          if (batch.current.has(source3)) {
            var batch_value = (
              /** @type {[any, boolean]} */
              batch.current.get(source3)[0]
            );
            if (is_earlier && value !== batch_value) {
              batch.current.set(source3, [value, is_derived]);
            } else {
              continue;
            }
          }
          sources.push(source3);
        }
        if (is_earlier) {
          for (const [effect2, deferred2] of this.async_deriveds) {
            const d = batch.async_deriveds.get(effect2);
            if (d) deferred2.promise.then(d.resolve).catch(d.reject);
          }
        }
        var current = [...batch.current.keys()].filter(
          (source3) => !/** @type {[any, boolean]} */
          batch.current.get(source3)[1]
        );
        if (!batch.#started || current.length === 0) continue;
        var others = current.filter((source3) => !this.current.has(source3));
        if (others.length === 0) {
          if (is_earlier) {
            batch.discard();
          }
        } else if (sources.length > 0) {
          if (is_earlier) {
            for (const unskipped of this.#unskipped_branches) {
              batch.unskip_effect(unskipped, (e) => {
                if ((e.f & (BLOCK_EFFECT | ASYNC)) !== 0) {
                  batch.schedule(e);
                } else {
                  batch.#defer_effects([e]);
                }
              });
            }
          }
          batch.activate();
          var marked = /* @__PURE__ */ new Set();
          var checked = /* @__PURE__ */ new Map();
          for (var source2 of sources) {
            mark_effects(source2, others, marked, checked);
          }
          checked = /* @__PURE__ */ new Map();
          var current_unequal = [...batch.current].filter(([c, v1]) => {
            const v2 = this.current.get(c);
            if (!v2) return true;
            return v2[0] !== v1[0] || v2[1] !== v1[1];
          }).map(([c]) => c);
          if (current_unequal.length > 0) {
            for (const effect2 of this.#new_effects) {
              if ((effect2.f & (DESTROYED | INERT | EAGER_EFFECT)) === 0 && depends_on(effect2, current_unequal, checked)) {
                if ((effect2.f & (ASYNC | BLOCK_EFFECT)) !== 0) {
                  set_signal_status(effect2, DIRTY);
                  batch.schedule(effect2);
                } else {
                  batch.#dirty_effects.add(effect2);
                }
              }
            }
          }
          if (batch.#scheduled.length > 0 && !batch.#decrement_queued) {
            batch.apply();
            for (var root2 of batch.#resolve()) {
              batch.#traverse(root2, [], []);
            }
          }
          batch.deactivate();
        }
      }
    }
    /**
     * @param {boolean} blocking
     * @param {Effect} effect
     */
    increment(blocking, effect2) {
      this.#pending += 1;
      if (blocking) {
        let blocking_pending_count = this.#blocking_pending.get(effect2) ?? 0;
        this.#blocking_pending.set(effect2, blocking_pending_count + 1);
      }
    }
    /**
     * @param {boolean} blocking
     * @param {Effect} effect
     */
    decrement(blocking, effect2) {
      this.#pending -= 1;
      if (blocking) {
        let blocking_pending_count = this.#blocking_pending.get(effect2) ?? 0;
        if (blocking_pending_count === 1) {
          this.#blocking_pending.delete(effect2);
        } else {
          this.#blocking_pending.set(effect2, blocking_pending_count - 1);
        }
      }
      if (this.#decrement_queued) return;
      this.#decrement_queued = true;
      queue_micro_task(() => {
        this.#decrement_queued = false;
        if (this.linked) {
          this.flush();
        }
      });
    }
    /**
     * @param {Set<Effect>} dirty_effects
     * @param {Set<Effect>} maybe_dirty_effects
     */
    transfer_effects(dirty_effects, maybe_dirty_effects) {
      for (const e of dirty_effects) {
        this.#dirty_effects.add(e);
      }
      for (const e of maybe_dirty_effects) {
        this.#maybe_dirty_effects.add(e);
      }
      dirty_effects.clear();
      maybe_dirty_effects.clear();
    }
    /** @param {(batch: Batch) => void} fn */
    oncommit(fn) {
      this.#commit_callbacks.add(fn);
    }
    /** @param {(batch: Batch) => void} fn */
    ondiscard(fn) {
      this.#discard_callbacks.add(fn);
    }
    settled() {
      return (this.#deferred ??= deferred()).promise;
    }
    static ensure() {
      if (current_batch === null) {
        const batch = current_batch = new Batch();
        if (!is_processing && !is_flushing_sync) {
          queue_micro_task(() => {
            if (!batch.#started) {
              batch.flush();
            }
          });
        }
      }
      return current_batch;
    }
    apply() {
      {
        batch_values = null;
        return;
      }
    }
    /**
     *
     * @param {Effect} effect
     */
    schedule(effect2) {
      last_scheduled_effect = effect2;
      if (effect2.b?.is_pending && (effect2.f & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 && (effect2.f & REACTION_RAN) === 0) {
        effect2.b.defer_effect(effect2);
        return;
      }
      this.#scheduled.push(effect2);
    }
    #unlink() {
      if (!this.linked) return;
      var prev = this.#prev;
      var next = this.#next;
      if (prev === null) {
        first_batch = next;
      } else {
        prev.#next = next;
      }
      if (next === null) {
        last_batch = prev;
      } else {
        next.#prev = prev;
      }
      this.linked = false;
    }
  }
  function flushSync(fn) {
    var was_flushing_sync = is_flushing_sync;
    var prev_previous_batch = previous_batch;
    previous_batch = null;
    is_flushing_sync = true;
    try {
      var result;
      if (fn) ;
      while (true) {
        flush_tasks();
        if (current_batch === null) {
          return (
            /** @type {T} */
            result
          );
        }
        current_batch.flush();
      }
    } finally {
      is_flushing_sync = was_flushing_sync;
      previous_batch = prev_previous_batch;
    }
  }
  function infinite_loop_guard() {
    try {
      effect_update_depth_exceeded();
    } catch (error) {
      invoke_error_boundary(error, last_scheduled_effect);
    }
  }
  let eager_block_effects = null;
  function flush_queued_effects(effects) {
    var length = effects.length;
    if (length === 0) return;
    var i = 0;
    while (i < length) {
      var effect2 = effects[i++];
      if ((effect2.f & (DESTROYED | INERT)) === 0 && is_dirty(effect2)) {
        eager_block_effects = /* @__PURE__ */ new Set();
        update_effect(effect2);
        if (effect2.deps === null && effect2.first === null && effect2.nodes === null && effect2.teardown === null && effect2.ac === null) {
          unlink_effect(effect2);
        }
        if (eager_block_effects?.size > 0) {
          old_values.clear();
          for (const e of eager_block_effects) {
            if ((e.f & (DESTROYED | INERT)) !== 0) continue;
            const ordered_effects = [e];
            let ancestor = e.parent;
            while (ancestor !== null) {
              if (eager_block_effects.has(ancestor)) {
                eager_block_effects.delete(ancestor);
                ordered_effects.push(ancestor);
              }
              ancestor = ancestor.parent;
            }
            for (let j = ordered_effects.length - 1; j >= 0; j--) {
              const e2 = ordered_effects[j];
              if ((e2.f & (DESTROYED | INERT)) !== 0) continue;
              update_effect(e2);
            }
          }
          eager_block_effects.clear();
        }
      }
    }
    eager_block_effects = null;
  }
  function mark_effects(value, sources, marked, checked) {
    if (marked.has(value)) return;
    marked.add(value);
    if (value.reactions !== null) {
      for (const reaction of value.reactions) {
        const flags2 = reaction.f;
        if ((flags2 & DERIVED) !== 0) {
          mark_effects(
            /** @type {Derived} */
            reaction,
            sources,
            marked,
            checked
          );
        } else if ((flags2 & (ASYNC | BLOCK_EFFECT)) !== 0 && (flags2 & DIRTY) === 0 && depends_on(reaction, sources, checked)) {
          set_signal_status(reaction, DIRTY);
          schedule_effect(
            /** @type {Effect} */
            reaction
          );
        }
      }
    }
  }
  function depends_on(reaction, sources, checked) {
    const depends = checked.get(reaction);
    if (depends !== void 0) return depends;
    if (reaction.deps !== null) {
      for (const dep of reaction.deps) {
        if (includes.call(sources, dep)) {
          return true;
        }
        if ((dep.f & DERIVED) !== 0 && depends_on(
          /** @type {Derived} */
          dep,
          sources,
          checked
        )) {
          checked.set(
            /** @type {Derived} */
            dep,
            true
          );
          return true;
        }
      }
    }
    checked.set(reaction, false);
    return false;
  }
  function schedule_effect(effect2) {
    current_batch.schedule(effect2);
  }
  function reset_branch(effect2, tracked) {
    if ((effect2.f & BRANCH_EFFECT) !== 0 && (effect2.f & CLEAN) !== 0) {
      return;
    }
    if ((effect2.f & DIRTY) !== 0) {
      tracked.d.push(effect2);
    } else if ((effect2.f & MAYBE_DIRTY) !== 0) {
      tracked.m.push(effect2);
    }
    set_signal_status(effect2, CLEAN);
    var e = effect2.first;
    while (e !== null) {
      reset_branch(e, tracked);
      e = e.next;
    }
  }
  function reset_all(effect2) {
    set_signal_status(effect2, CLEAN);
    var e = effect2.first;
    while (e !== null) {
      reset_all(e);
      e = e.next;
    }
  }
  let eager_effects = /* @__PURE__ */ new Set();
  const old_values = /* @__PURE__ */ new Map();
  let eager_effects_deferred = false;
  function source(v, stack) {
    var signal = {
      f: 0,
      // TODO ideally we could skip this altogether, but it causes type errors
      v,
      reactions: null,
      equals,
      rv: 0,
      wv: 0
    };
    return signal;
  }
  // @__NO_SIDE_EFFECTS__
  function state(v, stack) {
    const s = source(v);
    push_reaction_value(s);
    return s;
  }
  // @__NO_SIDE_EFFECTS__
  function mutable_source(initial_value, immutable = false, trackable = true) {
    const s = source(initial_value);
    if (!immutable) {
      s.equals = safe_equals;
    }
    if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
      (component_context.l.s ??= []).push(s);
    }
    return s;
  }
  function set(source2, value, should_proxy = false) {
    if (active_reaction !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
    // to ensure we error if state is set inside an inspect effect
    (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && (current_sources === null || !current_sources.has(source2))) {
      state_unsafe_mutation();
    }
    let new_value = should_proxy ? proxy(value) : value;
    return internal_set(source2, new_value, legacy_updates);
  }
  var seen = null;
  var count_deps = 0;
  function internal_set(source2, value, updated_during_traversal = null) {
    if (!source2.equals(value)) {
      if (is_destroying_effect) {
        old_values.set(source2, value);
      } else if (!old_values.has(source2)) {
        old_values.set(source2, source2.v);
      }
      var batch = Batch.ensure();
      batch.capture(source2, value);
      if ((source2.f & DERIVED) !== 0) {
        const derived2 = (
          /** @type {Derived} */
          source2
        );
        if ((source2.f & DIRTY) !== 0) {
          execute_derived(derived2);
        }
        if (batch_values === null) {
          update_derived_status(derived2);
        }
      }
      source2.wv = increment_write_version();
      seen = null;
      count_deps = 0;
      mark_reactions(source2, DIRTY, updated_during_traversal);
      seen = null;
      if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
        if (untracked_writes === null) {
          set_untracked_writes([source2]);
        } else {
          untracked_writes.push(source2);
        }
      }
      if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
        flush_eager_effects();
      }
    }
    return value;
  }
  function flush_eager_effects() {
    eager_effects_deferred = false;
    for (const effect2 of eager_effects) {
      if ((effect2.f & CLEAN) !== 0) {
        set_signal_status(effect2, MAYBE_DIRTY);
      }
      let dirty;
      try {
        dirty = is_dirty(effect2);
      } catch {
        dirty = true;
      }
      if (dirty) {
        update_effect(effect2);
      }
    }
    eager_effects.clear();
  }
  function increment(source2) {
    set(source2, source2.v + 1);
  }
  function mark_reactions(signal, status, updated_during_traversal) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    var runes = is_runes();
    var length = reactions.length;
    count_deps += length;
    if (count_deps > 1e5 && seen === null) seen = /* @__PURE__ */ new Set();
    if (seen !== null) {
      if (seen.has(signal)) return;
      seen.add(signal);
    }
    for (var i = 0; i < length; i++) {
      var reaction = reactions[i];
      var flags2 = reaction.f;
      if (!runes && reaction === active_effect) continue;
      var not_dirty = (flags2 & DIRTY) === 0;
      if (not_dirty) {
        set_signal_status(reaction, status);
      }
      if ((flags2 & EAGER_EFFECT) !== 0) {
        eager_effects.add(
          /** @type {Effect} */
          reaction
        );
      } else if ((flags2 & DERIVED) !== 0) {
        var derived2 = (
          /** @type {Derived} */
          reaction
        );
        batch_values?.delete(derived2);
        mark_reactions(derived2, MAYBE_DIRTY, updated_during_traversal);
      } else if (not_dirty) {
        var effect2 = (
          /** @type {Effect} */
          reaction
        );
        if ((flags2 & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
          eager_block_effects.add(effect2);
        }
        if (updated_during_traversal !== null) {
          updated_during_traversal.push(effect2);
        } else {
          schedule_effect(effect2);
        }
      }
    }
  }
  function proxy(value) {
    if (typeof value !== "object" || value === null || STATE_SYMBOL in value || COMPONENT_SYMBOL in value) {
      return value;
    }
    const prototype = get_prototype_of(value);
    if (prototype !== object_prototype && prototype !== array_prototype) {
      return value;
    }
    var sources = /* @__PURE__ */ new Map();
    var is_proxied_array = is_array(value);
    var version = /* @__PURE__ */ state(0);
    var parent_version = update_version;
    var with_parent = (fn) => {
      if (update_version === parent_version) {
        return fn();
      }
      var reaction = active_reaction;
      var version2 = update_version;
      set_active_reaction(null);
      set_update_version(parent_version);
      var result = fn();
      set_active_reaction(reaction);
      set_update_version(version2);
      return result;
    };
    if (is_proxied_array) {
      sources.set("length", /* @__PURE__ */ state(
        /** @type {any[]} */
        value.length
      ));
    }
    return new Proxy(
      /** @type {any} */
      value,
      {
        defineProperty(_, prop2, descriptor) {
          if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
            state_descriptors_fixed();
          }
          var s = sources.get(prop2);
          if (s === void 0) {
            with_parent(() => {
              var s2 = /* @__PURE__ */ state(descriptor.value);
              sources.set(prop2, s2);
              return s2;
            });
          } else {
            set(s, descriptor.value, true);
          }
          return true;
        },
        deleteProperty(target, prop2) {
          var s = sources.get(prop2);
          if (s === void 0) {
            if (prop2 in target) {
              const s2 = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED));
              sources.set(prop2, s2);
              increment(version);
            }
          } else {
            set(s, UNINITIALIZED);
            increment(version);
          }
          return true;
        },
        get(target, prop2, receiver) {
          if (prop2 === STATE_SYMBOL) {
            return value;
          }
          var s = sources.get(prop2);
          var exists = prop2 in target;
          if (s === void 0 && (!exists || get_descriptor(target, prop2)?.writable)) {
            s = with_parent(() => {
              var p = proxy(exists ? target[prop2] : UNINITIALIZED);
              var s2 = /* @__PURE__ */ state(p);
              return s2;
            });
            sources.set(prop2, s);
          }
          if (s !== void 0) {
            var v = get(s);
            return v === UNINITIALIZED ? void 0 : v;
          }
          return Reflect.get(target, prop2, receiver);
        },
        getOwnPropertyDescriptor(target, prop2) {
          this.has?.(target, prop2);
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          var s = sources.get(prop2);
          if (s !== void 0) {
            var value2 = get(s);
            if (value2 === UNINITIALIZED) {
              return void 0;
            }
            if (descriptor && "value" in descriptor) {
              descriptor.value = value2;
            } else {
              return {
                enumerable: true,
                configurable: true,
                value: value2,
                writable: true
              };
            }
          }
          return descriptor;
        },
        has(target, prop2) {
          if (prop2 === STATE_SYMBOL) {
            return true;
          }
          var s = sources.get(prop2);
          var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
          if (s !== void 0 || active_effect !== null && (!has || get_descriptor(target, prop2)?.writable)) {
            if (s === void 0) {
              s = with_parent(() => {
                var p = has ? proxy(target[prop2]) : UNINITIALIZED;
                var s2 = /* @__PURE__ */ state(p);
                return s2;
              });
              sources.set(prop2, s);
            }
            var value2 = get(s);
            if (value2 === UNINITIALIZED) {
              return false;
            }
          }
          return has;
        },
        set(target, prop2, value2, receiver) {
          var s = sources.get(prop2);
          var has = prop2 in target;
          if (is_proxied_array && prop2 === "length") {
            for (var i = value2; i < /** @type {Source<number>} */
            s.v; i += 1) {
              var other_s = sources.get(i + "");
              if (other_s !== void 0) {
                set(other_s, UNINITIALIZED);
              } else if (i in target) {
                other_s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED));
                sources.set(i + "", other_s);
              }
            }
          }
          if (s === void 0) {
            if (!has || get_descriptor(target, prop2)?.writable) {
              s = with_parent(() => /* @__PURE__ */ state(void 0));
              set(s, proxy(value2));
              sources.set(prop2, s);
            }
          } else {
            has = s.v !== UNINITIALIZED;
            var p = with_parent(() => proxy(value2));
            set(s, p);
          }
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor?.set) {
            descriptor.set.call(receiver, value2);
          }
          if (!has) {
            if (is_proxied_array && typeof prop2 === "string") {
              var ls = (
                /** @type {Source<number>} */
                sources.get("length")
              );
              var n = Number(prop2);
              if (Number.isInteger(n) && n >= ls.v) {
                set(ls, n + 1);
              }
            }
            increment(version);
          }
          return true;
        },
        ownKeys(target) {
          get(version);
          var own_keys = Reflect.ownKeys(target).filter((key2) => {
            var source3 = sources.get(key2);
            return source3 === void 0 || source3.v !== UNINITIALIZED;
          });
          for (var [key, source2] of sources) {
            if (source2.v !== UNINITIALIZED && !(key in target)) {
              own_keys.push(key);
            }
          }
          return own_keys;
        },
        setPrototypeOf() {
          state_prototype_fixed();
        }
      }
    );
  }
  function get_proxied_value(value) {
    try {
      if (value !== null && typeof value === "object" && STATE_SYMBOL in value) {
        return value[STATE_SYMBOL];
      }
    } catch {
    }
    return value;
  }
  function is(a, b) {
    return Object.is(get_proxied_value(a), get_proxied_value(b));
  }
  var $window;
  var is_firefox;
  var first_child_getter;
  var next_sibling_getter;
  function init_operations() {
    if ($window !== void 0) {
      return;
    }
    $window = window;
    is_firefox = /Firefox/.test(navigator.userAgent);
    var element_prototype = Element.prototype;
    var node_prototype = Node.prototype;
    var text_prototype = Text.prototype;
    first_child_getter = get_descriptor(node_prototype, "firstChild").get;
    next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
    if (is_extensible(element_prototype)) {
      element_prototype[CLASS_CACHE] = void 0;
      element_prototype[ATTRIBUTES_CACHE] = null;
      element_prototype[STYLE_CACHE] = void 0;
      element_prototype.__e = void 0;
    }
    if (is_extensible(text_prototype)) {
      text_prototype[TEXT_CACHE] = void 0;
    }
  }
  function create_text(value = "") {
    return document.createTextNode(value);
  }
  // @__NO_SIDE_EFFECTS__
  function get_first_child(node) {
    return (
      /** @type {TemplateNode | null} */
      first_child_getter.call(node)
    );
  }
  // @__NO_SIDE_EFFECTS__
  function get_next_sibling(node) {
    return (
      /** @type {TemplateNode | null} */
      next_sibling_getter.call(node)
    );
  }
  function child(node, is_text) {
    {
      return /* @__PURE__ */ get_first_child(node);
    }
  }
  function first_child(node, is_text = false) {
    {
      var first = /* @__PURE__ */ get_first_child(node);
      if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
      return first;
    }
  }
  function only_child(node, is_text = false) {
    {
      return /* @__PURE__ */ get_first_child(node);
    }
  }
  function sibling(node, count = 1, is_text = false) {
    let next_sibling = node;
    while (count--) {
      next_sibling = /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(next_sibling);
    }
    {
      return next_sibling;
    }
  }
  function clear_text_content(node) {
    node.textContent = "";
  }
  function should_defer_append() {
    return false;
  }
  function create_element(tag, namespace, is2) {
    {
      return (
        /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
        is2 ? document.createElement(tag, { is: is2 }) : document.createElement(tag)
      );
    }
  }
  function handle_error(error) {
    var effect2 = active_effect;
    if (effect2 === null) {
      active_reaction.f |= ERROR_VALUE;
      return error;
    }
    if ((effect2.f & REACTION_RAN) === 0 && (effect2.f & EFFECT) === 0) {
      throw error;
    }
    invoke_error_boundary(error, effect2);
  }
  function invoke_error_boundary(error, effect2) {
    if (error === HYDRATION_ERROR) {
      throw error;
    }
    if (effect2 !== null && (effect2.f & DESTROYED) !== 0) {
      return;
    }
    while (effect2 !== null) {
      if ((effect2.f & BOUNDARY_EFFECT) !== 0 && (effect2.f & (DESTROYED | DESTROYING)) === 0) {
        if ((effect2.f & REACTION_RAN) === 0) {
          throw error;
        }
        try {
          effect2.b.error(error);
          return;
        } catch (e) {
          error = e;
        }
      }
      effect2 = effect2.parent;
    }
    throw error;
  }
  function validate_effect(rune) {
    if (active_effect === null) {
      if (active_reaction === null) {
        effect_orphan();
      }
      effect_in_unowned_derived();
    }
    if (is_destroying_effect) {
      effect_in_teardown();
    }
  }
  function push_effect(effect2, parent_effect) {
    var parent_last = parent_effect.last;
    if (parent_last === null) {
      parent_effect.last = parent_effect.first = effect2;
    } else {
      parent_last.next = effect2;
      effect2.prev = parent_last;
      parent_effect.last = effect2;
    }
  }
  function create_effect(type, fn) {
    var parent = active_effect;
    if (parent !== null && (parent.f & INERT) !== 0) {
      type |= INERT;
    }
    var effect2 = {
      ctx: component_context,
      deps: null,
      nodes: null,
      f: type | DIRTY | CONNECTED,
      first: null,
      fn,
      last: null,
      next: null,
      parent,
      b: parent && parent.b,
      prev: null,
      teardown: null,
      wv: 0,
      ac: null
    };
    current_batch?.register_created_effect(effect2);
    var e = effect2;
    if ((type & EFFECT) !== 0) {
      if (collected_effects !== null) {
        collected_effects.push(effect2);
      } else {
        Batch.ensure().schedule(effect2);
      }
    } else if (fn !== null) {
      try {
        update_effect(effect2);
      } catch (e2) {
        destroy_effect(effect2);
        throw e2;
      }
      if (e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && // either `null`, or a singular child
      (e.f & EFFECT_PRESERVED) === 0) {
        e = e.first;
        if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
          e.f |= EFFECT_TRANSPARENT;
        }
      }
    }
    if (e !== null) {
      e.parent = parent;
      if (parent !== null) {
        push_effect(e, parent);
      }
      if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (type & ROOT_EFFECT) === 0) {
        var derived2 = (
          /** @type {Derived} */
          active_reaction
        );
        (derived2.effects ??= []).push(e);
      }
    }
    return effect2;
  }
  function effect_tracking() {
    return active_reaction !== null && !untracking;
  }
  function teardown(fn) {
    const effect2 = create_effect(RENDER_EFFECT, null);
    set_signal_status(effect2, CLEAN);
    effect2.teardown = fn;
    return effect2;
  }
  function user_effect(fn) {
    validate_effect();
    var flags2 = (
      /** @type {Effect} */
      active_effect.f
    );
    var defer = !active_reaction && (flags2 & BRANCH_EFFECT) !== 0 && component_context !== null && !component_context.i;
    if (defer) {
      var context = (
        /** @type {ComponentContext} */
        component_context
      );
      (context.e ??= []).push(fn);
    } else {
      return create_user_effect(fn);
    }
  }
  function create_user_effect(fn) {
    return create_effect(EFFECT | USER_EFFECT, fn);
  }
  function user_pre_effect(fn) {
    validate_effect();
    return create_effect(RENDER_EFFECT | USER_EFFECT, fn);
  }
  function component_root(fn) {
    Batch.ensure();
    const effect2 = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn);
    return (options = {}) => {
      return new Promise((fulfil) => {
        if (options.outro) {
          pause_effect(effect2, () => {
            destroy_effect(effect2);
            fulfil(void 0);
          });
        } else {
          destroy_effect(effect2);
          fulfil(void 0);
        }
      });
    };
  }
  function effect(fn) {
    return create_effect(EFFECT, fn);
  }
  function legacy_pre_effect(deps, fn) {
    var context = (
      /** @type {ComponentContextLegacy} */
      component_context
    );
    var token = { effect: null, ran: false, deps };
    context.l.$.push(token);
    token.effect = render_effect(() => {
      deps();
      if (token.ran) return;
      token.ran = true;
      var effect2 = (
        /** @type {Effect} */
        active_effect
      );
      try {
        set_active_effect(effect2.parent);
        untrack(fn);
      } finally {
        set_active_effect(effect2);
      }
    });
  }
  function legacy_pre_effect_reset() {
    var context = (
      /** @type {ComponentContextLegacy} */
      component_context
    );
    render_effect(() => {
      for (var token of context.l.$) {
        token.deps();
        var effect2 = token.effect;
        if ((effect2.f & CLEAN) !== 0 && effect2.deps !== null) {
          set_signal_status(effect2, MAYBE_DIRTY);
        }
        if (is_dirty(effect2)) {
          update_effect(effect2);
        }
        token.ran = false;
      }
    });
  }
  function async_effect(fn) {
    return create_effect(ASYNC | EFFECT_PRESERVED, fn);
  }
  function render_effect(fn, flags2 = 0) {
    return create_effect(RENDER_EFFECT | flags2, fn);
  }
  function template_effect(fn, sync = [], async = [], blockers = []) {
    flatten(blockers, sync, async, (values) => {
      create_effect(RENDER_EFFECT, () => {
        fn(...values.map(get));
      });
    });
  }
  function block(fn, flags2 = 0) {
    var effect2 = create_effect(BLOCK_EFFECT | flags2, fn);
    return effect2;
  }
  function branch(fn) {
    return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn);
  }
  function execute_effect_teardown(effect2) {
    var teardown2 = effect2.teardown;
    if (teardown2 !== null) {
      const previously_destroying_effect = is_destroying_effect;
      const previous_reaction = active_reaction;
      set_is_destroying_effect(true);
      set_active_reaction(null);
      try {
        teardown2.call(null);
      } catch (error) {
        invoke_error_boundary(error, effect2.parent);
      } finally {
        set_is_destroying_effect(previously_destroying_effect);
        set_active_reaction(previous_reaction);
      }
    }
  }
  function destroy_effect_children(signal, remove_dom = false) {
    var effect2 = signal.first;
    signal.first = signal.last = null;
    while (effect2 !== null) {
      const controller = effect2.ac;
      if (controller !== null) {
        without_reactive_context(() => {
          controller.abort(STALE_REACTION);
        });
      }
      var next = effect2.next;
      if ((effect2.f & ROOT_EFFECT) !== 0) {
        effect2.parent = null;
      } else {
        destroy_effect(effect2, remove_dom);
      }
      effect2 = next;
    }
  }
  function destroy_block_effect_children(signal) {
    var effect2 = signal.first;
    while (effect2 !== null) {
      var next = effect2.next;
      if ((effect2.f & BRANCH_EFFECT) === 0) {
        destroy_effect(effect2);
      }
      effect2 = next;
    }
  }
  function destroy_effect(effect2, remove_dom = true) {
    var removed = false;
    if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes !== null && effect2.nodes.end !== null) {
      remove_effect_dom(
        effect2.nodes.start,
        /** @type {TemplateNode} */
        effect2.nodes.end
      );
      removed = true;
    }
    effect2.f |= DESTROYING;
    destroy_effect_children(effect2, remove_dom && !removed);
    remove_reactions(effect2, 0);
    var transitions = effect2.nodes && effect2.nodes.t;
    if (transitions !== null) {
      for (const transition of transitions) {
        transition.stop();
      }
    }
    execute_effect_teardown(effect2);
    effect2.f ^= DESTROYING;
    effect2.f |= DESTROYED;
    var parent = effect2.parent;
    if (parent !== null && parent.first !== null) {
      unlink_effect(effect2);
    }
    effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes = effect2.ac = effect2.b = null;
  }
  function remove_effect_dom(node, end) {
    while (node !== null) {
      var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
      node.remove();
      node = next;
    }
  }
  function unlink_effect(effect2) {
    var parent = effect2.parent;
    var prev = effect2.prev;
    var next = effect2.next;
    if (prev !== null) prev.next = next;
    if (next !== null) next.prev = prev;
    if (parent !== null) {
      if (parent.first === effect2) parent.first = next;
      if (parent.last === effect2) parent.last = prev;
    }
  }
  function pause_effect(effect2, callback, destroy = true) {
    var transitions = [];
    effect2.f |= PAUSED;
    pause_children(effect2, transitions, true);
    var fn = () => {
      if (destroy) destroy_effect(effect2);
      if (callback) callback();
    };
    var remaining = transitions.length;
    if (remaining > 0) {
      var check = () => --remaining || fn();
      for (var transition of transitions) {
        transition.out(check);
      }
    } else {
      fn();
    }
  }
  function pause_children(effect2, transitions, local) {
    if ((effect2.f & INERT) !== 0) return;
    effect2.f ^= INERT;
    var t = effect2.nodes && effect2.nodes.t;
    if (t !== null) {
      for (const transition of t) {
        if (transition.is_global || local) {
          transitions.push(transition);
        }
      }
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      if ((child2.f & ROOT_EFFECT) === 0) {
        var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (child2.f & BRANCH_EFFECT) !== 0 && (effect2.f & BLOCK_EFFECT) !== 0;
        pause_children(child2, transitions, transparent ? local : false);
      }
      child2 = sibling2;
    }
  }
  function resume_effect(effect2) {
    effect2.f &= ~PAUSED;
    resume_children(effect2, true);
  }
  function resume_children(effect2, local) {
    if ((effect2.f & PAUSED) !== 0) return;
    if ((effect2.f & INERT) === 0) return;
    effect2.f ^= INERT;
    if ((effect2.f & CLEAN) === 0) {
      set_signal_status(effect2, DIRTY);
      Batch.ensure().schedule(effect2);
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
      resume_children(child2, transparent ? local : false);
      child2 = sibling2;
    }
    var t = effect2.nodes && effect2.nodes.t;
    if (t !== null) {
      for (const transition of t) {
        if (transition.is_global || local) {
          transition.in();
        }
      }
    }
  }
  function move_effect(effect2, fragment) {
    if (!effect2.nodes) return;
    var node = effect2.nodes.start;
    var end = effect2.nodes.end;
    while (node !== null) {
      var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
      fragment.append(node);
      node = next;
    }
  }
  let captured_signals = null;
  function capture_signals(fn) {
    var previous_captured_signals = captured_signals;
    try {
      captured_signals = /* @__PURE__ */ new Set();
      untrack(fn);
      if (previous_captured_signals !== null) {
        for (var signal of captured_signals) {
          previous_captured_signals.add(signal);
        }
      }
      return captured_signals;
    } finally {
      captured_signals = previous_captured_signals;
    }
  }
  function invalidate_inner_signals(fn) {
    for (var signal of capture_signals(fn)) {
      internal_set(signal, signal.v);
    }
  }
  let is_destroying_effect = false;
  function set_is_destroying_effect(value) {
    is_destroying_effect = value;
  }
  let active_reaction = null;
  let untracking = false;
  function set_active_reaction(reaction) {
    active_reaction = reaction;
  }
  let active_effect = null;
  function set_active_effect(effect2) {
    active_effect = effect2;
  }
  let current_sources = null;
  function push_reaction_value(value) {
    if (active_reaction !== null && ((active_reaction.f & REACTION_IS_UPDATING) !== 0 || (active_reaction.f & DERIVED) !== 0)) {
      (current_sources ??= /* @__PURE__ */ new Set()).add(value);
    }
  }
  let new_deps = null;
  let skipped_deps = 0;
  let untracked_writes = null;
  function set_untracked_writes(value) {
    untracked_writes = value;
  }
  let write_version = 1;
  let read_version = 0;
  let update_version = read_version;
  function set_update_version(value) {
    update_version = value;
  }
  function increment_write_version() {
    return ++write_version;
  }
  function is_dirty(reaction) {
    var flags2 = reaction.f;
    if ((flags2 & DIRTY) !== 0) {
      return true;
    }
    if ((flags2 & MAYBE_DIRTY) !== 0) {
      var dependencies = (
        /** @type {Value[]} */
        reaction.deps
      );
      var length = dependencies.length;
      for (var i = 0; i < length; i++) {
        var dependency = dependencies[i];
        if (is_dirty(
          /** @type {Derived} */
          dependency
        )) {
          update_derived(
            /** @type {Derived} */
            dependency
          );
        }
        if (dependency.wv > reaction.wv) {
          return true;
        }
      }
      if ((flags2 & CONNECTED) !== 0 && // During time traveling we don't want to reset the status so that
      // traversal of the graph in the other batches still happens
      batch_values === null) {
        set_signal_status(reaction, CLEAN);
      }
    }
    return false;
  }
  function schedule_possible_effect_self_invalidation(signal, effect2, root2 = true) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    if (current_sources !== null && current_sources.has(signal)) {
      return;
    }
    for (var i = 0; i < reactions.length; i++) {
      var reaction = reactions[i];
      if ((reaction.f & DERIVED) !== 0) {
        schedule_possible_effect_self_invalidation(
          /** @type {Derived} */
          reaction,
          effect2,
          false
        );
      } else if (effect2 === reaction) {
        if (root2) {
          set_signal_status(reaction, DIRTY);
        } else if ((reaction.f & CLEAN) !== 0) {
          set_signal_status(reaction, MAYBE_DIRTY);
        }
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
  function update_reaction(reaction) {
    var previous_deps = new_deps;
    var previous_skipped_deps = skipped_deps;
    var previous_untracked_writes = untracked_writes;
    var previous_reaction = active_reaction;
    var previous_sources = current_sources;
    var previous_component_context = component_context;
    var previous_untracking = untracking;
    var previous_update_version = update_version;
    var flags2 = reaction.f;
    new_deps = /** @type {null | Value[]} */
    null;
    skipped_deps = 0;
    untracked_writes = null;
    active_reaction = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
    current_sources = null;
    set_component_context(reaction.ctx);
    untracking = false;
    update_version = ++read_version;
    if (reaction.ac !== null) {
      without_reactive_context(() => {
        reaction.ac.abort(STALE_REACTION);
      });
      reaction.ac = null;
    }
    try {
      reaction.f |= REACTION_IS_UPDATING;
      var fn = (
        /** @type {Function} */
        reaction.fn
      );
      var result = fn();
      reaction.f |= REACTION_RAN;
      var deps = update_dependencies(reaction);
      if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0) {
        for (var i = 0; i < /** @type {Source[]} */
        untracked_writes.length; i++) {
          schedule_possible_effect_self_invalidation(
            untracked_writes[i],
            /** @type {Effect} */
            reaction
          );
        }
      }
      if (previous_reaction !== null && previous_reaction !== reaction) {
        read_version++;
        if (previous_reaction.deps !== null) {
          for (let i2 = 0; i2 < previous_skipped_deps; i2 += 1) {
            previous_reaction.deps[i2].rv = read_version;
          }
        }
        if (previous_deps !== null) {
          for (const dep of previous_deps) {
            dep.rv = read_version;
          }
        }
        if (untracked_writes !== null) {
          if (previous_untracked_writes === null) {
            previous_untracked_writes = untracked_writes;
          } else {
            previous_untracked_writes.push(.../** @type {Source[]} */
            untracked_writes);
          }
        }
      }
      if ((reaction.f & ERROR_VALUE) !== 0) {
        reaction.f ^= ERROR_VALUE;
      }
      return result;
    } catch (error) {
      update_dependencies(reaction);
      return handle_error(error);
    } finally {
      reaction.f ^= REACTION_IS_UPDATING;
      new_deps = previous_deps;
      skipped_deps = previous_skipped_deps;
      untracked_writes = previous_untracked_writes;
      active_reaction = previous_reaction;
      current_sources = previous_sources;
      set_component_context(previous_component_context);
      untracking = previous_untracking;
      update_version = previous_update_version;
    }
  }
  function update_dependencies(reaction) {
    var deps = reaction.deps;
    var is_fork = current_batch?.is_fork;
    if (new_deps !== null) {
      var i;
      if (!is_fork) {
        remove_reactions(reaction, skipped_deps);
      }
      if (deps !== null && skipped_deps > 0) {
        deps.length = skipped_deps + new_deps.length;
        for (i = 0; i < new_deps.length; i++) {
          deps[skipped_deps + i] = new_deps[i];
        }
      } else {
        reaction.deps = deps = new_deps;
      }
      if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
        for (i = skipped_deps; i < deps.length; i++) {
          (deps[i].reactions ??= []).push(reaction);
        }
      }
    } else if (!is_fork && deps !== null && skipped_deps < deps.length) {
      remove_reactions(reaction, skipped_deps);
      deps.length = skipped_deps;
    }
    return deps;
  }
  function remove_reaction(signal, dependency) {
    let reactions = dependency.reactions;
    if (reactions !== null) {
      var index2 = index_of.call(reactions, signal);
      if (index2 !== -1) {
        var new_length = reactions.length - 1;
        if (new_length === 0) {
          reactions = dependency.reactions = null;
        } else {
          reactions[index2] = reactions[new_length];
          reactions.pop();
        }
      }
    }
    if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
    // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
    // allows us to skip the expensive work of disconnecting and immediately reconnecting it
    (new_deps === null || !includes.call(new_deps, dependency))) {
      var derived2 = (
        /** @type {Derived} */
        dependency
      );
      if ((derived2.f & CONNECTED) !== 0) {
        derived2.f ^= CONNECTED;
      }
      if (derived2.v !== UNINITIALIZED) {
        update_derived_status(derived2);
      }
      if (derived2.ac !== null) {
        without_reactive_context(() => {
          derived2.ac.abort(STALE_REACTION);
          derived2.ac = null;
          set_signal_status(derived2, DIRTY);
        });
      }
      freeze_derived_effects(derived2);
      remove_reactions(derived2, 0);
    }
  }
  function remove_reactions(signal, start_index) {
    var dependencies = signal.deps;
    if (dependencies === null) return;
    for (var i = start_index; i < dependencies.length; i++) {
      remove_reaction(signal, dependencies[i]);
    }
  }
  function update_effect(effect2) {
    var flags2 = effect2.f;
    if ((flags2 & DESTROYED) !== 0) {
      return;
    }
    set_signal_status(effect2, CLEAN);
    var previous_effect = active_effect;
    active_effect = effect2;
    try {
      if ((flags2 & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
        destroy_block_effect_children(effect2);
      } else {
        destroy_effect_children(effect2);
      }
      execute_effect_teardown(effect2);
      var teardown2 = update_reaction(effect2);
      effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
      effect2.wv = write_version;
      var dep;
      if (DEV && tracing_mode_flag && (effect2.f & DIRTY) !== 0 && effect2.deps !== null) ;
    } finally {
      active_effect = previous_effect;
    }
  }
  async function tick() {
    await Promise.resolve();
    flushSync();
  }
  function get(signal) {
    var flags2 = signal.f;
    var is_derived = (flags2 & DERIVED) !== 0;
    captured_signals?.add(signal);
    if (active_reaction !== null && !untracking) {
      var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
      if (!destroyed && (current_sources === null || !current_sources.has(signal))) {
        var deps = active_reaction.deps;
        if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
          if (signal.rv < read_version) {
            signal.rv = read_version;
            if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
              skipped_deps++;
            } else if (new_deps === null) {
              new_deps = [signal];
            } else {
              new_deps.push(signal);
            }
          }
        } else {
          active_reaction.deps ??= [];
          if (!includes.call(active_reaction.deps, signal)) {
            active_reaction.deps.push(signal);
          }
          var reactions = signal.reactions;
          if (reactions === null) {
            signal.reactions = [active_reaction];
          } else if (!includes.call(reactions, active_reaction)) {
            reactions.push(active_reaction);
          }
        }
      }
    }
    if (is_destroying_effect && old_values.has(signal)) {
      return old_values.get(signal);
    }
    if (is_derived) {
      var derived2 = (
        /** @type {Derived} */
        signal
      );
      if (is_destroying_effect) {
        var value = derived2.v;
        if ((derived2.f & CLEAN) === 0 && derived2.reactions !== null || depends_on_old_values(derived2)) {
          value = execute_derived(derived2);
        }
        old_values.set(derived2, value);
        return value;
      }
      var should_connect = (derived2.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (active_reaction.f & CONNECTED) !== 0;
      var is_new = (derived2.f & REACTION_RAN) === 0;
      if (is_dirty(derived2)) {
        if (should_connect) {
          derived2.f |= CONNECTED;
        }
        update_derived(derived2);
      }
      if (should_connect && !is_new) {
        unfreeze_derived_effects(derived2);
        reconnect(derived2);
      }
    }
    if (batch_values?.has(signal)) {
      return batch_values.get(signal);
    }
    if ((signal.f & ERROR_VALUE) !== 0) {
      throw signal.v;
    }
    return signal.v;
  }
  function reconnect(derived2) {
    derived2.f |= CONNECTED;
    if (derived2.deps === null) return;
    for (const dep of derived2.deps) {
      var reactions = dep.reactions;
      if (reactions === null) {
        dep.reactions = [derived2];
      } else if (!includes.call(reactions, derived2)) {
        reactions.push(derived2);
      }
      if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
        unfreeze_derived_effects(
          /** @type {Derived} */
          dep
        );
        reconnect(
          /** @type {Derived} */
          dep
        );
      }
    }
  }
  function depends_on_old_values(derived2) {
    if (derived2.v === UNINITIALIZED) return true;
    if (derived2.deps === null) return false;
    for (const dep of derived2.deps) {
      if (old_values.has(dep)) {
        return true;
      }
      if ((dep.f & DERIVED) !== 0 && depends_on_old_values(
        /** @type {Derived} */
        dep
      )) {
        return true;
      }
    }
    return false;
  }
  function untrack(fn) {
    var previous_untracking = untracking;
    try {
      untracking = true;
      return fn();
    } finally {
      untracking = previous_untracking;
    }
  }
  function deep_read_state(value) {
    if (typeof value !== "object" || !value || value instanceof EventTarget) {
      return;
    }
    if (STATE_SYMBOL in value) {
      deep_read(value);
    } else if (!Array.isArray(value)) {
      for (let key in value) {
        const prop2 = value[key];
        if (typeof prop2 === "object" && prop2 && STATE_SYMBOL in prop2) {
          deep_read(prop2);
        }
      }
    }
  }
  function deep_read(value, visited = /* @__PURE__ */ new Set()) {
    if (typeof value === "object" && value !== null && // We don't want to traverse DOM elements
    !(value instanceof EventTarget) && !visited.has(value)) {
      visited.add(value);
      if (value instanceof Date) {
        value.getTime();
      }
      for (let key in value) {
        try {
          deep_read(value[key], visited);
        } catch (e) {
        }
      }
      const proto = get_prototype_of(value);
      if (proto !== Object.prototype && proto !== Array.prototype && proto !== Map.prototype && proto !== Set.prototype && proto !== Date.prototype) {
        const descriptors = get_descriptors(proto);
        for (let key in descriptors) {
          const get2 = descriptors[key].get;
          if (get2) {
            try {
              get2.call(value);
            } catch (e) {
            }
          }
        }
      }
    }
  }
  const PASSIVE_EVENTS = ["touchstart", "touchmove"];
  function is_passive_event(name) {
    return PASSIVE_EVENTS.includes(name);
  }
  const event_symbol = /* @__PURE__ */ Symbol("events");
  const all_registered_events = /* @__PURE__ */ new Set();
  const root_event_handles = /* @__PURE__ */ new Set();
  function create_event(event_name, dom, handler, options = {}) {
    function target_handler(event2) {
      if (!options.capture) {
        handle_event_propagation.call(dom, event2);
      }
      if (!event2.cancelBubble) {
        return without_reactive_context(() => {
          return handler?.call(this, event2);
        });
      }
    }
    if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") {
      target_handler.__removed = false;
      queue_micro_task(() => {
        if (!target_handler.__removed) {
          dom.addEventListener(event_name, target_handler, options);
        }
      });
    } else {
      dom.addEventListener(event_name, target_handler, options);
    }
    return target_handler;
  }
  function event(event_name, dom, handler, capture2, passive) {
    var options = { capture: capture2, passive };
    var target_handler = create_event(event_name, dom, handler, options);
    if (dom === document.body || // @ts-ignore
    dom === window || // @ts-ignore
    dom === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
    dom instanceof HTMLMediaElement) {
      teardown(() => {
        target_handler.__removed = true;
        dom.removeEventListener(event_name, target_handler, options);
      });
    }
  }
  function delegated(event_name, element, handler) {
    (element[event_symbol] ??= {})[event_name] = handler;
  }
  function delegate(events) {
    for (var i = 0; i < events.length; i++) {
      all_registered_events.add(events[i]);
    }
    for (var fn of root_event_handles) {
      fn(events);
    }
  }
  let last_propagated_event = null;
  let last_propagated_event_clear_scheduled = false;
  function handle_event_propagation(event2) {
    var handler_element = this;
    var owner_document = (
      /** @type {Node} */
      handler_element.ownerDocument
    );
    var event_name = event2.type;
    var path = event2.composedPath?.() || [];
    var current_target = (
      /** @type {null | Element} */
      path[0] || event2.target
    );
    last_propagated_event = event2;
    if (!last_propagated_event_clear_scheduled) {
      last_propagated_event_clear_scheduled = true;
      setTimeout(() => {
        last_propagated_event_clear_scheduled = false;
        last_propagated_event = null;
      });
    }
    var path_idx = 0;
    var handled_at = last_propagated_event === event2 && event2[event_symbol];
    if (handled_at) {
      var at_idx = path.indexOf(handled_at);
      if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
      window)) {
        event2[event_symbol] = handler_element;
        return;
      }
      var handler_idx = path.indexOf(handler_element);
      if (handler_idx === -1) {
        return;
      }
      if (at_idx <= handler_idx) {
        path_idx = at_idx;
      }
    }
    current_target = /** @type {Element} */
    path[path_idx] || event2.target;
    if (current_target === handler_element) return;
    define_property(event2, "currentTarget", {
      configurable: true,
      get() {
        return current_target || owner_document;
      }
    });
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      var throw_error;
      var other_errors = [];
      while (current_target !== null) {
        if (current_target === handler_element) break;
        try {
          var delegated2 = current_target[event_symbol]?.[event_name];
          if (delegated2 != null && (!/** @type {any} */
          current_target.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          event2.target === current_target)) {
            delegated2.call(current_target, event2);
          }
        } catch (error) {
          if (throw_error) {
            other_errors.push(error);
          } else {
            throw_error = error;
          }
        }
        if (event2.cancelBubble) break;
        path_idx++;
        current_target = path_idx < path.length ? (
          /** @type {Element} */
          path[path_idx]
        ) : null;
      }
      if (throw_error) {
        for (let error of other_errors) {
          queueMicrotask(() => {
            throw error;
          });
        }
        throw throw_error;
      }
    } finally {
      event2[event_symbol] = handler_element;
      delete event2.currentTarget;
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }
  const policy = (
    // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
    globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
      /** @param {string} html */
      createHTML: (html) => {
        return html;
      }
    })
  );
  function create_trusted_html(html) {
    return (
      /** @type {string} */
      policy?.createHTML(html) ?? html
    );
  }
  function create_fragment_from_html(html) {
    var elem = create_element("template");
    elem.innerHTML = create_trusted_html(html.replaceAll("<!>", "<!---->"));
    return elem.content;
  }
  function assign_nodes(start, end) {
    var effect2 = (
      /** @type {Effect} */
      active_effect
    );
    if (effect2.nodes === null) {
      effect2.nodes = { start, end, a: null, t: null };
    }
  }
  // @__NO_SIDE_EFFECTS__
  function from_html(content, flags2) {
    var is_fragment = (flags2 & TEMPLATE_FRAGMENT) !== 0;
    var use_import_node = (flags2 & TEMPLATE_USE_IMPORT_NODE) !== 0;
    var node;
    var has_start = !content.startsWith("<!>");
    return () => {
      if (node === void 0) {
        node = create_fragment_from_html(has_start ? content : "<!>" + content);
        if (!is_fragment) node = /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(node);
      }
      var clone = (
        /** @type {TemplateNode} */
        use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
      );
      if (is_fragment) {
        var start = (
          /** @type {TemplateNode} */
          /* @__PURE__ */ get_first_child(clone)
        );
        var end = (
          /** @type {TemplateNode} */
          clone.lastChild
        );
        assign_nodes(start, end);
      } else {
        assign_nodes(clone, clone);
      }
      return clone;
    };
  }
  function text(value = "") {
    {
      var t = create_text(value + "");
      assign_nodes(t, t);
      return t;
    }
  }
  function comment() {
    var frag = document.createDocumentFragment();
    var start = document.createComment("");
    var anchor = create_text();
    frag.append(start, anchor);
    assign_nodes(start, anchor);
    return frag;
  }
  function append(anchor, dom) {
    if (anchor === null) {
      return;
    }
    anchor.before(
      /** @type {Node} */
      dom
    );
  }
  function createSubscriber(start) {
    let subscribers = 0;
    let version = source(0);
    let stop;
    return () => {
      if (effect_tracking()) {
        get(version);
        render_effect(() => {
          if (subscribers === 0) {
            stop = untrack(() => start(() => increment(version)));
          }
          subscribers += 1;
          return () => {
            queue_micro_task(() => {
              subscribers -= 1;
              if (subscribers === 0) {
                stop?.();
                stop = void 0;
                increment(version);
              }
            });
          };
        });
      }
    };
  }
  var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
  function boundary(node, props, children, transform_error) {
    new Boundary(node, props, children, transform_error);
  }
  class Boundary {
    /** @type {Boundary | null} */
    parent;
    is_pending = false;
    /**
     * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
     * Inherited from parent boundary, or defaults to identity.
     * @type {(error: unknown) => unknown}
     */
    transform_error;
    /** @type {TemplateNode} */
    #anchor;
    /** @type {TemplateNode | null} */
    #hydrate_open = null;
    /** @type {BoundaryProps} */
    #props;
    /** @type {((anchor: Node) => void)} */
    #children;
    /** @type {Effect} */
    #effect;
    /** @type {Effect | null} */
    #main_effect = null;
    /** @type {Effect | null} */
    #pending_effect = null;
    /** @type {Effect | null} */
    #failed_effect = null;
    /** @type {DocumentFragment | null} */
    #offscreen_fragment = null;
    #local_pending_count = 0;
    #pending_count = 0;
    #pending_count_update_queued = false;
    /** @type {Set<Effect>} */
    #dirty_effects = /* @__PURE__ */ new Set();
    /** @type {Set<Effect>} */
    #maybe_dirty_effects = /* @__PURE__ */ new Set();
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    #effect_pending = null;
    #effect_pending_subscriber = createSubscriber(() => {
      this.#effect_pending = source(this.#local_pending_count);
      return () => {
        this.#effect_pending = null;
      };
    });
    /**
     * @param {TemplateNode} node
     * @param {BoundaryProps} props
     * @param {((anchor: Node) => void)} children
     * @param {((error: unknown) => unknown) | undefined} [transform_error]
     */
    constructor(node, props, children, transform_error) {
      this.#anchor = node;
      this.#props = props;
      this.#children = (anchor) => {
        var effect2 = (
          /** @type {Effect} */
          active_effect
        );
        effect2.b = this;
        effect2.f |= BOUNDARY_EFFECT;
        children(anchor);
      };
      this.parent = /** @type {Effect} */
      active_effect.b;
      this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
      this.#effect = block(() => {
        {
          this.#render();
        }
      }, flags);
    }
    #hydrate_resolved_content() {
      try {
        this.#main_effect = branch(() => this.#children(this.#anchor));
      } catch (error) {
        this.error(error);
      }
    }
    /**
     * @param {unknown} error The deserialized error from the server's hydration comment
     */
    #hydrate_failed_content(error) {
      const failed = this.#props.failed;
      const { reset, invoke_onerror } = this.#create_reset(error);
      queue_micro_task(invoke_onerror);
      if (!failed) return;
      this.#failed_effect = branch(() => {
        failed(
          this.#anchor,
          () => error,
          () => reset
        );
      });
    }
    /**
     * Creates the `reset` function for a failed boundary, along with a function
     * that invokes `onerror` with it (if provided)
     * @param {unknown} error
     * @returns {{ reset: () => void, invoke_onerror: () => void }}
     */
    #create_reset(error) {
      var did_reset = false;
      var calling_on_error = false;
      const reset = () => {
        if (this.#is_destroyed()) return;
        if (did_reset) {
          svelte_boundary_reset_noop();
          return;
        }
        did_reset = true;
        if (calling_on_error) {
          svelte_boundary_reset_onerror();
        }
        if (this.#failed_effect !== null) {
          pause_effect(this.#failed_effect, () => {
            this.#failed_effect = null;
          });
        }
        this.#run(() => {
          this.#render();
        });
      };
      const invoke_onerror = () => {
        if (this.#is_destroyed()) return;
        try {
          calling_on_error = true;
          this.#props.onerror?.(error, reset);
          calling_on_error = false;
        } catch (err) {
          invoke_error_boundary(err, this.#effect && this.#effect.parent);
        }
      };
      return { reset, invoke_onerror };
    }
    #is_destroyed() {
      return (this.#effect.f & (DESTROYED | DESTROYING)) !== 0;
    }
    #hydrate_pending_content() {
      const pending = this.#props.pending;
      if (!pending) return;
      this.is_pending = true;
      this.#pending_effect = branch(() => pending(this.#anchor));
      queue_micro_task(() => {
        if (this.#is_destroyed()) return;
        var fragment = this.#offscreen_fragment = document.createDocumentFragment();
        var anchor = create_text();
        var handled = false;
        fragment.append(anchor);
        this.#main_effect = this.#run(() => {
          try {
            return branch(() => this.#children(anchor));
          } catch (error) {
            try {
              this.error(error);
              handled = true;
            } catch (error2) {
              invoke_error_boundary(error2, this.#effect.parent);
            }
            return null;
          }
        });
        if (this.#main_effect === null) {
          this.#offscreen_fragment = null;
          if (handled) this.#resolve(
            /** @type {Batch} */
            current_batch
          );
          return;
        }
        if (this.#pending_count === 0) {
          this.#anchor.before(fragment);
          this.#offscreen_fragment = null;
          pause_effect(
            /** @type {Effect} */
            this.#pending_effect,
            () => {
              this.#pending_effect = null;
            }
          );
          this.#resolve(
            /** @type {Batch} */
            current_batch
          );
        }
      });
    }
    #render() {
      try {
        this.is_pending = this.has_pending_snippet();
        this.#pending_count = 0;
        this.#local_pending_count = 0;
        this.#main_effect = branch(() => {
          this.#children(this.#anchor);
        });
        if (this.#pending_count > 0) {
          var fragment = this.#offscreen_fragment = document.createDocumentFragment();
          move_effect(this.#main_effect, fragment);
          const pending = (
            /** @type {(anchor: Node) => void} */
            this.#props.pending
          );
          this.#pending_effect = branch(() => pending(this.#anchor));
        } else {
          this.#resolve(
            /** @type {Batch} */
            current_batch
          );
        }
      } catch (error) {
        this.error(error);
      }
    }
    /**
     * @param {Batch} batch
     */
    #resolve(batch) {
      this.is_pending = false;
      batch.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);
    }
    /**
     * Defer an effect inside a pending boundary until the boundary resolves
     * @param {Effect} effect
     */
    defer_effect(effect2) {
      defer_effect(effect2, this.#dirty_effects, this.#maybe_dirty_effects);
    }
    /**
     * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
     * @returns {boolean}
     */
    is_rendered() {
      return !this.is_pending && (!this.parent || this.parent.is_rendered());
    }
    has_pending_snippet() {
      return !!this.#props.pending;
    }
    /**
     * @template T
     * @param {() => T} fn
     */
    #run(fn) {
      var previous_effect = active_effect;
      var previous_reaction = active_reaction;
      var previous_ctx = component_context;
      set_active_effect(this.#effect);
      set_active_reaction(this.#effect);
      set_component_context(this.#effect.ctx);
      try {
        Batch.ensure();
        return fn();
      } finally {
        set_active_effect(previous_effect);
        set_active_reaction(previous_reaction);
        set_component_context(previous_ctx);
      }
    }
    /**
     * Updates the pending count associated with the currently visible pending snippet,
     * if any, such that we can replace the snippet with content once work is done
     * @param {1 | -1} d
     * @param {Batch} batch
     */
    #update_pending_count(d, batch) {
      if (!this.has_pending_snippet()) {
        if (this.parent) {
          this.parent.#update_pending_count(d, batch);
        }
        return;
      }
      this.#pending_count += d;
      if (this.#pending_count === 0) {
        this.#resolve(batch);
        if (this.#pending_effect) {
          pause_effect(this.#pending_effect, () => {
            this.#pending_effect = null;
          });
        }
        if (this.#offscreen_fragment) {
          this.#anchor.before(this.#offscreen_fragment);
          this.#offscreen_fragment = null;
        }
      }
    }
    /**
     * Update the source that powers `$effect.pending()` inside this boundary,
     * and controls when the current `pending` snippet (if any) is removed.
     * Do not call from inside the class
     * @param {1 | -1} d
     * @param {Batch} batch
     */
    update_pending_count(d, batch) {
      this.#update_pending_count(d, batch);
      this.#local_pending_count += d;
      if (!this.#effect_pending || this.#pending_count_update_queued) return;
      this.#pending_count_update_queued = true;
      queue_micro_task(() => {
        this.#pending_count_update_queued = false;
        if (this.#effect_pending) {
          internal_set(this.#effect_pending, this.#local_pending_count);
        }
      });
    }
    get_effect_pending() {
      this.#effect_pending_subscriber();
      return get(
        /** @type {Source<number>} */
        this.#effect_pending
      );
    }
    /** @param {unknown} error */
    error(error) {
      if (error === HYDRATION_ERROR) {
        throw error;
      }
      if (!this.#props.onerror && !this.#props.failed) {
        throw error;
      }
      if (current_batch?.is_fork) {
        if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
        if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
        if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);
        current_batch.oncommit(() => {
          if (!this.#is_destroyed()) this.#handle_error(error);
        });
      } else {
        this.#handle_error(error);
      }
    }
    /**
     * @param {unknown} error
     */
    #handle_error(error) {
      if (this.#main_effect) {
        destroy_effect(this.#main_effect);
        this.#main_effect = null;
      }
      if (this.#pending_effect) {
        destroy_effect(this.#pending_effect);
        this.#pending_effect = null;
      }
      if (this.#failed_effect) {
        destroy_effect(this.#failed_effect);
        this.#failed_effect = null;
      }
      let failed = this.#props.failed;
      const handle_error_result = (transformed_error) => {
        if (this.#is_destroyed()) return;
        const { reset, invoke_onerror } = this.#create_reset(transformed_error);
        invoke_onerror();
        if (failed && !this.#is_destroyed()) {
          this.#failed_effect = this.#run(() => {
            try {
              return branch(() => {
                var effect2 = (
                  /** @type {Effect} */
                  active_effect
                );
                effect2.b = this;
                effect2.f |= BOUNDARY_EFFECT;
                failed(
                  this.#anchor,
                  () => transformed_error,
                  () => reset
                );
              });
            } catch (error2) {
              invoke_error_boundary(
                error2,
                /** @type {Effect} */
                this.#effect.parent
              );
              return null;
            }
          });
        }
      };
      queue_micro_task(() => {
        if (this.#is_destroyed()) return;
        var result;
        try {
          result = this.transform_error(error);
        } catch (e) {
          invoke_error_boundary(e, this.#effect && this.#effect.parent);
          return;
        }
        if (result !== null && typeof result === "object" && typeof /** @type {any} */
        result.then === "function") {
          result.then(
            handle_error_result,
            /** @param {unknown} e */
            (e) => invoke_error_boundary(e, this.#effect && this.#effect.parent)
          );
        } else {
          handle_error_result(result);
        }
      });
    }
  }
  function set_text(text2, value) {
    var str = value == null ? "" : typeof value === "object" ? `${value}` : value;
    if (str !== /** @type {any} */
    (text2[TEXT_CACHE] ??= text2.nodeValue)) {
      text2[TEXT_CACHE] = str;
      text2.nodeValue = `${str}`;
    }
  }
  function mount(component, options) {
    return _mount(component, options);
  }
  const listeners = /* @__PURE__ */ new Map();
  function _mount(Component, { target, anchor, props = {}, events, context, intro = true, transformError }) {
    init_operations();
    var component = void 0;
    var unmount2 = component_root(() => {
      var anchor_node = anchor ?? target.appendChild(create_text());
      boundary(
        /** @type {TemplateNode} */
        anchor_node,
        {
          pending: () => {
          }
        },
        (anchor_node2) => {
          push({});
          var ctx = (
            /** @type {ComponentContext} */
            component_context
          );
          if (context) ctx.c = context;
          if (events) {
            props.$$events = events;
          }
          component = Component(anchor_node2, props) || mark_as_component();
          pop();
        },
        transformError
      );
      var registered_events = /* @__PURE__ */ new Set();
      var event_handle = (events2) => {
        for (var i = 0; i < events2.length; i++) {
          var event_name = events2[i];
          if (registered_events.has(event_name)) continue;
          registered_events.add(event_name);
          var passive = is_passive_event(event_name);
          for (const node of [target, document]) {
            var counts = listeners.get(node);
            if (counts === void 0) {
              counts = /* @__PURE__ */ new Map();
              listeners.set(node, counts);
            }
            var count = counts.get(event_name);
            if (count === void 0) {
              node.addEventListener(event_name, handle_event_propagation, { passive });
              counts.set(event_name, 1);
            } else {
              counts.set(event_name, count + 1);
            }
          }
        }
      };
      event_handle(array_from(all_registered_events));
      root_event_handles.add(event_handle);
      return () => {
        for (var event_name of registered_events) {
          for (const node of [target, document]) {
            var counts = (
              /** @type {Map<string, number>} */
              listeners.get(node)
            );
            var count = (
              /** @type {number} */
              counts.get(event_name)
            );
            if (--count == 0) {
              node.removeEventListener(event_name, handle_event_propagation);
              counts.delete(event_name);
              if (counts.size === 0) {
                listeners.delete(node);
              }
            } else {
              counts.set(event_name, count);
            }
          }
        }
        root_event_handles.delete(event_handle);
        if (anchor_node !== anchor) {
          anchor_node.parentNode?.removeChild(anchor_node);
        }
      };
    });
    mounted_components.set(component, unmount2);
    return component;
  }
  let mounted_components = /* @__PURE__ */ new WeakMap();
  function unmount(component, options) {
    const fn = mounted_components.get(component);
    if (fn) {
      mounted_components.delete(component);
      return fn(options);
    }
    return Promise.resolve();
  }
  class BranchManager {
    /** @type {TemplateNode} */
    anchor;
    /** @type {Map<Batch, Key>} */
    #batches = /* @__PURE__ */ new Map();
    /**
     * Map of keys to effects that are currently rendered in the DOM.
     * These effects are visible and actively part of the document tree.
     * Example:
     * ```
     * {#if condition}
     * 	foo
     * {:else}
     * 	bar
     * {/if}
     * ```
     * Can result in the entries `true->Effect` and `false->Effect`
     * @type {Map<Key, Effect>}
     */
    #onscreen = /* @__PURE__ */ new Map();
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    #offscreen = /* @__PURE__ */ new Map();
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    #outroing = /* @__PURE__ */ new Set();
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    #transition = true;
    /**
     * @param {TemplateNode} anchor
     * @param {boolean} transition
     */
    constructor(anchor, transition = true) {
      this.anchor = anchor;
      this.#transition = transition;
    }
    /**
     * @param {Batch} batch
     */
    #commit = (batch) => {
      if (!this.#batches.has(batch)) return;
      var key = (
        /** @type {Key} */
        this.#batches.get(batch)
      );
      var onscreen = this.#onscreen.get(key);
      if (onscreen) {
        resume_effect(onscreen);
        this.#outroing.delete(key);
      } else {
        var offscreen = this.#offscreen.get(key);
        if (offscreen) {
          resume_effect(offscreen.effect);
          this.#onscreen.set(key, offscreen.effect);
          this.#offscreen.delete(key);
          offscreen.fragment.lastChild.remove();
          this.anchor.before(offscreen.fragment);
          onscreen = offscreen.effect;
        }
      }
      for (const [b, k] of this.#batches) {
        this.#batches.delete(b);
        if (b === batch) {
          break;
        }
        const offscreen2 = this.#offscreen.get(k);
        if (offscreen2) {
          destroy_effect(offscreen2.effect);
          this.#offscreen.delete(k);
        }
      }
      for (const [k, effect2] of this.#onscreen) {
        if (k === key || this.#outroing.has(k)) continue;
        const on_destroy = () => {
          const keys = Array.from(this.#batches.values());
          if (keys.includes(k)) {
            var fragment = document.createDocumentFragment();
            move_effect(effect2, fragment);
            fragment.append(create_text());
            this.#offscreen.set(k, { effect: effect2, fragment });
          } else {
            destroy_effect(effect2);
          }
          this.#outroing.delete(k);
          this.#onscreen.delete(k);
        };
        if (this.#transition || !onscreen) {
          this.#outroing.add(k);
          pause_effect(effect2, on_destroy, false);
        } else {
          on_destroy();
        }
      }
    };
    /**
     * @param {Batch} batch
     */
    #discard = (batch) => {
      this.#batches.delete(batch);
      const keys = Array.from(this.#batches.values());
      for (const [k, branch2] of this.#offscreen) {
        if (!keys.includes(k)) {
          destroy_effect(branch2.effect);
          this.#offscreen.delete(k);
        }
      }
    };
    /**
     *
     * @param {any} key
     * @param {null | ((target: TemplateNode) => void)} fn
     */
    ensure(key, fn) {
      var batch = (
        /** @type {Batch} */
        current_batch
      );
      var defer = should_defer_append();
      if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) {
        if (defer) {
          var fragment = document.createDocumentFragment();
          var target = create_text();
          fragment.append(target);
          this.#offscreen.set(key, {
            effect: branch(() => fn(target)),
            fragment
          });
        } else {
          this.#onscreen.set(
            key,
            branch(() => fn(this.anchor))
          );
        }
      }
      this.#batches.set(batch, key);
      if (defer) {
        for (const [k, effect2] of this.#onscreen) {
          if (k === key) {
            batch.unskip_effect(effect2);
          } else {
            batch.skip_effect(effect2);
          }
        }
        for (const [k, branch2] of this.#offscreen) {
          if (k === key) {
            batch.unskip_effect(branch2.effect);
          } else {
            batch.skip_effect(branch2.effect);
          }
        }
        batch.oncommit(this.#commit);
        batch.ondiscard(this.#discard);
      } else {
        this.#commit(batch);
      }
    }
  }
  function if_block(node, fn, elseif = false) {
    var branches = new BranchManager(node);
    var flags2 = elseif ? EFFECT_TRANSPARENT : 0;
    function update_branch(key, fn2) {
      branches.ensure(key, fn2);
    }
    block(() => {
      var has_branch = false;
      fn((fn2, key = 0) => {
        has_branch = true;
        update_branch(key, fn2);
      });
      if (!has_branch) {
        update_branch(-1, null);
      }
    }, flags2);
  }
  function index(_, i) {
    return i;
  }
  function pause_effects(state2, to_destroy, controlled_anchor) {
    var transitions = [];
    var length = to_destroy.length;
    var group;
    var remaining = to_destroy.length;
    for (var i = 0; i < length; i++) {
      let effect2 = to_destroy[i];
      pause_effect(
        effect2,
        () => {
          if (group) {
            group.pending.delete(effect2);
            group.done.add(effect2);
            if (group.pending.size === 0) {
              var groups = (
                /** @type {Set<EachOutroGroup>} */
                state2.outrogroups
              );
              destroy_effects(state2, array_from(group.done));
              groups.delete(group);
              if (groups.size === 0) {
                state2.outrogroups = null;
              }
            }
          } else {
            remaining -= 1;
          }
        },
        false
      );
    }
    if (remaining === 0) {
      var fast_path = transitions.length === 0 && controlled_anchor !== null && state2.pending.size === 0;
      if (fast_path) {
        var anchor = (
          /** @type {Element} */
          controlled_anchor
        );
        var parent_node = (
          /** @type {Element} */
          anchor.parentNode
        );
        clear_text_content(parent_node);
        parent_node.append(anchor);
        state2.items.clear();
      }
      destroy_effects(state2, to_destroy, !fast_path);
    } else {
      group = {
        pending: new Set(to_destroy),
        done: /* @__PURE__ */ new Set()
      };
      (state2.outrogroups ??= /* @__PURE__ */ new Set()).add(group);
    }
  }
  function destroy_effects(state2, to_destroy, remove_dom = true) {
    var preserved_effects;
    if (state2.pending.size > 0) {
      preserved_effects = /* @__PURE__ */ new Set();
      for (const keys of state2.pending.values()) {
        for (const key of keys) {
          preserved_effects.add(
            /** @type {EachItem} */
            state2.items.get(key).e
          );
        }
      }
    }
    for (var i = 0; i < to_destroy.length; i++) {
      var e = to_destroy[i];
      if (preserved_effects?.has(e)) {
        e.f |= EFFECT_OFFSCREEN;
        const fragment = document.createDocumentFragment();
        move_effect(e, fragment);
      } else {
        destroy_effect(to_destroy[i], remove_dom);
      }
    }
  }
  var offscreen_anchor;
  function each(node, flags2, get_collection, get_key, render_fn, fallback_fn = null) {
    var anchor = node;
    var items = /* @__PURE__ */ new Map();
    var is_controlled = (flags2 & EACH_IS_CONTROLLED) !== 0;
    if (is_controlled) {
      var parent_node = (
        /** @type {Element} */
        node
      );
      anchor = parent_node.appendChild(create_text());
    }
    var fallback = null;
    var each_array = /* @__PURE__ */ derived_safe_equal(() => {
      var collection = get_collection();
      return (
        /** @type {V[]} */
        is_array(collection) ? collection : collection == null ? [] : array_from(collection)
      );
    });
    var pending = /* @__PURE__ */ new Map();
    var first_run = true;
    function commit(batch) {
      if ((state2.effect.f & DESTROYED) !== 0) {
        return;
      }
      state2.pending.delete(batch);
      var array = get(each_array);
      state2.fallback = fallback;
      reconcile(state2, array, anchor, flags2, get_key);
      if (fallback !== null) {
        if (array.length === 0) {
          if ((fallback.f & EFFECT_OFFSCREEN) === 0) {
            resume_effect(fallback);
          } else {
            fallback.f ^= EFFECT_OFFSCREEN;
            move(fallback, null, anchor);
          }
        } else {
          pause_effect(fallback, () => {
            fallback = null;
          });
        }
      }
    }
    function discard(batch) {
      state2.pending.delete(batch);
    }
    var effect2 = block(() => {
      var array = (
        /** @type {V[]} */
        get(each_array)
      );
      var length = array.length;
      var keys = /* @__PURE__ */ new Set();
      var batch = (
        /** @type {Batch} */
        current_batch
      );
      var defer = should_defer_append();
      for (var index2 = 0; index2 < length; index2 += 1) {
        var value = array[index2];
        var key = get_key(value, index2);
        var item = first_run ? null : items.get(key);
        if (item) {
          if (item.v) internal_set(item.v, value);
          if (item.i) internal_set(item.i, index2);
          if (defer) {
            batch.unskip_effect(item.e);
          }
        } else {
          item = create_item(
            items,
            first_run ? anchor : offscreen_anchor ??= create_text(),
            value,
            key,
            index2,
            render_fn,
            flags2,
            get_collection
          );
          if (!first_run) {
            item.e.f |= EFFECT_OFFSCREEN;
          }
          items.set(key, item);
        }
        keys.add(key);
      }
      if (length === 0 && fallback_fn && !fallback) {
        if (first_run) {
          fallback = branch(() => fallback_fn(anchor));
        } else {
          fallback = branch(() => fallback_fn(offscreen_anchor ??= create_text()));
          fallback.f |= EFFECT_OFFSCREEN;
        }
      }
      if (length > keys.size) {
        {
          each_key_duplicate();
        }
      }
      if (!first_run) {
        pending.set(batch, keys);
        if (defer) {
          for (const [key2, item2] of items) {
            if (!keys.has(key2)) {
              batch.skip_effect(item2.e);
            }
          }
          batch.oncommit(commit);
          batch.ondiscard(discard);
        } else {
          commit(batch);
        }
      }
      get(each_array);
    });
    var state2 = { effect: effect2, items, pending, outrogroups: null, fallback };
    first_run = false;
  }
  function skip_to_branch(effect2) {
    while (effect2 !== null && (effect2.f & BRANCH_EFFECT) === 0) {
      effect2 = effect2.next;
    }
    return effect2;
  }
  function reconcile(state2, array, anchor, flags2, get_key) {
    var is_animated = (flags2 & EACH_IS_ANIMATED) !== 0;
    var length = array.length;
    var items = state2.items;
    var current = skip_to_branch(state2.effect.first);
    var seen2;
    var prev = null;
    var to_animate;
    var matched = [];
    var stashed = [];
    var value;
    var key;
    var effect2;
    var i;
    if (is_animated) {
      for (i = 0; i < length; i += 1) {
        value = array[i];
        key = get_key(value, i);
        effect2 = /** @type {EachItem} */
        items.get(key).e;
        if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
          effect2.nodes?.a?.measure();
          (to_animate ??= /* @__PURE__ */ new Set()).add(effect2);
        }
      }
    }
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key = get_key(value, i);
      effect2 = /** @type {EachItem} */
      items.get(key).e;
      if (state2.outrogroups !== null) {
        for (const group of state2.outrogroups) {
          group.pending.delete(effect2);
          group.done.delete(effect2);
        }
      }
      if ((effect2.f & INERT) !== 0) {
        resume_effect(effect2);
        if (is_animated) {
          effect2.nodes?.a?.unfix();
          (to_animate ??= /* @__PURE__ */ new Set()).delete(effect2);
        }
      }
      if ((effect2.f & EFFECT_OFFSCREEN) !== 0) {
        effect2.f ^= EFFECT_OFFSCREEN;
        if (effect2 === current) {
          move(effect2, null, anchor);
        } else {
          var next = prev ? prev.next : current;
          if (effect2 === state2.effect.last) {
            state2.effect.last = effect2.prev;
          }
          if (effect2.prev) effect2.prev.next = effect2.next;
          if (effect2.next) effect2.next.prev = effect2.prev;
          link(state2, prev, effect2);
          link(state2, effect2, next);
          move(effect2, next, anchor);
          prev = effect2;
          matched = [];
          stashed = [];
          current = skip_to_branch(prev.next);
          continue;
        }
      }
      if (effect2 !== current) {
        if (seen2 !== void 0 && seen2.has(effect2)) {
          if (matched.length < stashed.length) {
            var start = stashed[0];
            var j;
            prev = start.prev;
            var a = matched[0];
            var b = matched[matched.length - 1];
            for (j = 0; j < matched.length; j += 1) {
              move(matched[j], start, anchor);
            }
            for (j = 0; j < stashed.length; j += 1) {
              seen2.delete(stashed[j]);
            }
            link(state2, a.prev, b.next);
            link(state2, prev, a);
            link(state2, b, start);
            current = start;
            prev = b;
            i -= 1;
            matched = [];
            stashed = [];
          } else {
            seen2.delete(effect2);
            move(effect2, current, anchor);
            link(state2, effect2.prev, effect2.next);
            link(state2, effect2, prev === null ? state2.effect.first : prev.next);
            link(state2, prev, effect2);
            prev = effect2;
          }
          continue;
        }
        matched = [];
        stashed = [];
        while (current !== null && current !== effect2) {
          (seen2 ??= /* @__PURE__ */ new Set()).add(current);
          stashed.push(current);
          current = skip_to_branch(current.next);
        }
        if (current === null) {
          continue;
        }
      }
      if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
        matched.push(effect2);
      }
      prev = effect2;
      current = skip_to_branch(effect2.next);
    }
    if (state2.outrogroups !== null) {
      for (const group of state2.outrogroups) {
        if (group.pending.size === 0) {
          destroy_effects(state2, array_from(group.done));
          state2.outrogroups?.delete(group);
        }
      }
      if (state2.outrogroups.size === 0) {
        state2.outrogroups = null;
      }
    }
    if (current !== null || seen2 !== void 0) {
      var to_destroy = [];
      if (seen2 !== void 0) {
        for (effect2 of seen2) {
          if ((effect2.f & INERT) === 0) {
            to_destroy.push(effect2);
          }
        }
      }
      while (current !== null) {
        if ((current.f & INERT) === 0 && current !== state2.fallback) {
          to_destroy.push(current);
        }
        current = skip_to_branch(current.next);
      }
      var destroy_length = to_destroy.length;
      if (destroy_length > 0) {
        var controlled_anchor = (flags2 & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
        if (is_animated) {
          for (i = 0; i < destroy_length; i += 1) {
            to_destroy[i].nodes?.a?.measure();
          }
          for (i = 0; i < destroy_length; i += 1) {
            to_destroy[i].nodes?.a?.fix();
          }
        }
        pause_effects(state2, to_destroy, controlled_anchor);
      }
    }
    if (is_animated) {
      queue_micro_task(() => {
        if (to_animate === void 0) return;
        for (effect2 of to_animate) {
          effect2.nodes?.a?.apply();
        }
      });
    }
  }
  function create_item(items, anchor, value, key, index2, render_fn, flags2, get_collection) {
    var v = (flags2 & EACH_ITEM_REACTIVE) !== 0 ? (flags2 & EACH_ITEM_IMMUTABLE) === 0 ? /* @__PURE__ */ mutable_source(value, false, false) : source(value) : null;
    var i = (flags2 & EACH_INDEX_REACTIVE) !== 0 ? source(index2) : null;
    return {
      v,
      i,
      e: branch(() => {
        render_fn(anchor, v ?? value, i ?? index2, get_collection);
        return () => {
          items.delete(key);
        };
      })
    };
  }
  function move(effect2, next, anchor) {
    if (!effect2.nodes) return;
    var node = effect2.nodes.start;
    var end = effect2.nodes.end;
    var dest = next && (next.f & EFFECT_OFFSCREEN) === 0 ? (
      /** @type {EffectNodes} */
      next.nodes.start
    ) : anchor;
    while (node !== null) {
      var next_node = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(node)
      );
      dest.before(node);
      if (node === end) {
        return;
      }
      node = next_node;
    }
  }
  function link(state2, prev, next) {
    if (prev === null) {
      state2.effect.first = next;
    } else {
      prev.next = next;
    }
    if (next === null) {
      state2.effect.last = prev;
    } else {
      next.prev = prev;
    }
  }
  const whitespace = [..." 	\n\r\f \v\uFEFF"];
  function to_class(value, hash, directives) {
    var classname = value == null ? "" : "" + value;
    if (hash) {
      classname = classname ? classname + " " + hash : hash;
    }
    if (directives) {
      for (var key of Object.keys(directives)) {
        if (directives[key]) {
          classname = classname ? classname + " " + key : key;
        } else if (classname.length) {
          var len = key.length;
          var a = 0;
          while ((a = classname.indexOf(key, a)) >= 0) {
            var b = a + len;
            if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) {
              classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
            } else {
              a = b;
            }
          }
        }
      }
    }
    return classname === "" ? null : classname;
  }
  function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
    var prev = (
      /** @type {any} */
      dom[CLASS_CACHE]
    );
    if (prev !== value || prev === void 0) {
      var next_class_name = to_class(value, hash, next_classes);
      {
        if (next_class_name == null) {
          dom.removeAttribute("class");
        } else {
          dom.className = next_class_name;
        }
      }
      dom[CLASS_CACHE] = value;
    } else if (next_classes && prev_classes !== next_classes) {
      for (var key in next_classes) {
        var is_present = !!next_classes[key];
        if (prev_classes == null || is_present !== !!prev_classes[key]) {
          dom.classList.toggle(key, is_present);
        }
      }
    }
    return next_classes;
  }
  function set_selected(option, selected) {
    if (selected) {
      if (!option.hasAttribute("selected")) option.setAttribute("selected", "");
    } else {
      option.removeAttribute("selected");
    }
  }
  function apply_default_select_value(select, preserve) {
    var value = select.__defaultValue;
    var multiple = select.multiple;
    var values = multiple ? value ?? [] : null;
    if (multiple && !is_array(values)) return;
    select.selectedIndex;
    for (var option of select.options) {
      var option_value = get_option_value(option);
      set_selected(
        option,
        multiple ? (
          /** @type {any[]} */
          values.includes(option_value)
        ) : is(option_value, value)
      );
    }
    return;
  }
  function select_option(select, value, mounting = false) {
    if (select.multiple) {
      if (value == void 0) {
        return;
      }
      if (!is_array(value)) {
        return select_multiple_invalid_value();
      }
      for (var option of select.options) {
        option.selected = value.includes(get_option_value(option));
      }
      return;
    }
    for (option of select.options) {
      var option_value = get_option_value(option);
      if (is(option_value, value)) {
        option.selected = true;
        return;
      }
    }
    if (!mounting || value !== void 0) {
      select.selectedIndex = -1;
    }
  }
  function init_select(select) {
    var observer = new MutationObserver((entries) => {
      if (entries.every(is_selectedcontent_mutation)) return;
      if ("__defaultValue" in select) {
        apply_default_select_value(select);
      }
      if ("__value" in select) {
        select_option(select, select.__value);
      }
    });
    observer.observe(select, {
      // Listen to option element changes
      childList: true,
      subtree: true,
      // because of <optgroup>
      // Listen to option element value attribute changes
      // (doesn't get notified of select value changes,
      // because that property is not reflected as an attribute)
      attributes: true,
      attributeFilter: ["value"]
    });
    teardown(() => {
      observer.disconnect();
    });
  }
  function bind_select_value(select, get2, set2 = get2) {
    var batches = /* @__PURE__ */ new WeakSet();
    var mounting = true;
    listen_to_event_and_reset_event(select, "change", (is_reset) => {
      var query = is_reset ? "[selected]" : ":checked";
      var value;
      if (select.multiple) {
        value = [].map.call(select.querySelectorAll(query), get_option_value);
      } else {
        var selected_option = select.querySelector(query) ?? // will fall back to first non-disabled option if no option is selected
        select.querySelector("option:not([disabled])");
        value = selected_option && get_option_value(selected_option);
      }
      set2(value);
      select.__value = value;
      if (current_batch !== null) {
        batches.add(current_batch);
      }
    });
    effect(() => {
      var value = get2();
      if (select === document.activeElement) {
        var batch = (
          /** @type {Batch} */
          current_batch
        );
        if (batches.has(batch)) {
          return;
        }
      }
      select_option(select, value, mounting);
      if (mounting && value === void 0) {
        var selected_option = select.querySelector(":checked");
        if (selected_option !== null) {
          value = get_option_value(selected_option);
          set2(value);
        }
      }
      select.__value = value;
      mounting = false;
    });
  }
  function get_option_value(option) {
    if ("__value" in option) {
      return option.__value;
    } else {
      return option.value;
    }
  }
  function is_selectedcontent_mutation(entry) {
    if (
      /** @type {Element} */
      entry.target.closest("selectedcontent") !== null
    ) {
      return true;
    }
    if (entry.type === "childList") {
      var nodes = [...entry.addedNodes, ...entry.removedNodes];
      return nodes.length > 0 && nodes.every((node) => node.nodeName === "SELECTEDCONTENT");
    }
    return false;
  }
  const IS_CUSTOM_ELEMENT = /* @__PURE__ */ Symbol("is custom element");
  const IS_HTML = /* @__PURE__ */ Symbol("is html");
  const PROGRESS_TAG = IS_XHTML ? "progress" : "PROGRESS";
  function set_value(element, value) {
    var attributes = get_attributes(element);
    if (attributes.value === (attributes.value = // treat null and undefined the same for the initial value
    value ?? void 0) || // @ts-expect-error
    // `progress` elements always need their value set when it's `0`
    element.value === value && (value !== 0 || element.nodeName !== PROGRESS_TAG)) {
      return;
    }
    element.value = value ?? "";
  }
  function set_checked(element, checked) {
    var attributes = get_attributes(element);
    if (attributes.checked === (attributes.checked = // treat null and undefined the same for the initial value
    checked ?? void 0)) {
      return;
    }
    element.checked = checked;
  }
  function set_attribute(element, attribute, value, skip_warning) {
    var attributes = get_attributes(element);
    if (attributes[attribute] === (attributes[attribute] = value)) return;
    if (attribute === "loading") {
      element[LOADING_ATTR_SYMBOL] = value;
    }
    if (value == null) {
      element.removeAttribute(attribute);
    } else if (typeof value !== "string" && get_setters(element).has(attribute)) {
      element[attribute] = value;
    } else {
      element.setAttribute(attribute, value);
    }
  }
  function get_attributes(element) {
    return (
      /** @type {Record<string | symbol, unknown>} **/
      /** @type {any} */
      element[ATTRIBUTES_CACHE] ??= {
        [IS_CUSTOM_ELEMENT]: element.nodeName.includes("-"),
        [IS_HTML]: element.namespaceURI === NAMESPACE_HTML
      }
    );
  }
  var setters_cache = /* @__PURE__ */ new Map();
  function get_setters(element) {
    var cache_key = element.getAttribute("is") || element.nodeName;
    var setters = setters_cache.get(cache_key);
    if (setters) return setters;
    setters_cache.set(cache_key, setters = /* @__PURE__ */ new Set());
    var descriptors;
    var proto = element;
    var element_proto = Element.prototype;
    while (element_proto !== proto) {
      descriptors = get_descriptors(proto);
      for (var key in descriptors) {
        if (descriptors[key].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
        key !== "innerHTML" && key !== "textContent" && key !== "innerText") {
          setters.add(key);
        }
      }
      proto = get_prototype_of(proto);
    }
    return setters;
  }
  function bind_value(input, get2, set2 = get2) {
    var batches = /* @__PURE__ */ new WeakSet();
    listen_to_event_and_reset_event(input, "input", async (is_reset) => {
      var value = is_reset ? input.defaultValue : input.value;
      value = is_numberlike_input(input) ? to_number(value) : value;
      set2(value);
      if (current_batch !== null) {
        batches.add(current_batch);
      }
      await tick();
      if (value !== (value = get2())) {
        var start = input.selectionStart;
        var end = input.selectionEnd;
        var length = input.value.length;
        input.value = value ?? "";
        if (end !== null) {
          var new_length = input.value.length;
          if (start === end && end === length && new_length > length) {
            input.selectionStart = new_length;
            input.selectionEnd = new_length;
          } else {
            input.selectionStart = start;
            input.selectionEnd = Math.min(end, new_length);
          }
        }
      }
    });
    if (
      // If we are hydrating and the value has since changed,
      // then use the updated value from the input instead.
      // If defaultValue is set, then value == defaultValue
      // TODO Svelte 6: remove input.value check and set to empty string?
      untrack(get2) == null && input.value
    ) {
      set2(is_numberlike_input(input) ? to_number(input.value) : input.value);
      if (current_batch !== null) {
        batches.add(current_batch);
      }
    }
    render_effect(() => {
      var value = get2();
      if (input === document.activeElement) {
        var batch = (
          /** @type {Batch} */
          current_batch
        );
        if (batches.has(batch)) {
          return;
        }
      }
      if (is_numberlike_input(input) && value === to_number(input.value)) {
        return;
      }
      if (input.type === "date" && !value && !input.value) {
        return;
      }
      if (value !== input.value) {
        input.value = value ?? "";
      }
    });
  }
  function is_numberlike_input(input) {
    var type = input.type;
    return type === "number" || type === "range";
  }
  function to_number(value) {
    return value === "" ? null : +value;
  }
  function is_bound_this(bound_value, element_or_component) {
    return bound_value === element_or_component || bound_value?.[STATE_SYMBOL] === element_or_component;
  }
  function bind_this(element_or_component = mark_as_component(), update, get_value, get_parts) {
    var component_effect = (
      /** @type {ComponentContext} */
      component_context.r
    );
    var parent = (
      /** @type {Effect} */
      active_effect
    );
    effect(() => {
      var old_parts;
      var parts;
      render_effect(() => {
        old_parts = parts;
        parts = [];
        untrack(() => {
          if (!is_bound_this(get_value(...parts), element_or_component)) {
            update(element_or_component, ...parts);
            if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
              update(null, ...old_parts);
            }
          }
        });
      });
      return () => {
        let p = parent;
        while (p !== component_effect && p.parent !== null && p.parent.f & DESTROYING) {
          p = p.parent;
        }
        const teardown2 = () => {
          if (parts && is_bound_this(get_value(...parts), element_or_component)) {
            update(null, ...parts);
          }
        };
        const original_teardown = p.teardown;
        p.teardown = () => {
          teardown2();
          original_teardown?.();
        };
      };
    });
    return element_or_component;
  }
  function init(immutable = false) {
    const context = (
      /** @type {ComponentContextLegacy} */
      component_context
    );
    const callbacks = context.l.u;
    if (!callbacks) return;
    let props = () => deep_read_state(context.s);
    if (immutable) {
      let version = 0;
      let prev = (
        /** @type {Record<string, any>} */
        {}
      );
      const d = /* @__PURE__ */ derived(() => {
        let changed = false;
        const props2 = context.s;
        for (const key in props2) {
          if (props2[key] !== prev[key]) {
            prev[key] = props2[key];
            changed = true;
          }
        }
        if (changed) version++;
        return version;
      });
      props = () => get(d);
    }
    if (callbacks.b.length) {
      user_pre_effect(() => {
        observe_all(context, props);
        run_all(callbacks.b);
      });
    }
    user_effect(() => {
      const fns = untrack(() => callbacks.m.map(run));
      return () => {
        for (const fn of fns) {
          if (typeof fn === "function") {
            fn();
          }
        }
      };
    });
    if (callbacks.a.length) {
      user_effect(() => {
        observe_all(context, props);
        run_all(callbacks.a);
      });
    }
  }
  function observe_all(context, props) {
    if (context.l.s) {
      for (const signal of context.l.s) get(signal);
    }
    props();
  }
  let is_store_binding = false;
  function capture_store_binding(fn) {
    var previous_is_store_binding = is_store_binding;
    try {
      is_store_binding = false;
      return [fn(), is_store_binding];
    } finally {
      is_store_binding = previous_is_store_binding;
    }
  }
  function prop(props, key, flags2, fallback) {
    var runes = !legacy_mode_flag || (flags2 & PROPS_IS_RUNES) !== 0;
    var bindable = (flags2 & PROPS_IS_BINDABLE) !== 0;
    var lazy = (flags2 & PROPS_IS_LAZY_INITIAL) !== 0;
    var fallback_value = (
      /** @type {V} */
      fallback
    );
    var fallback_dirty = true;
    var fallback_signal = (
      /** @type {Derived<V> | undefined} */
      void 0
    );
    var get_fallback = () => {
      if (lazy && runes) {
        fallback_signal ??= /* @__PURE__ */ derived(
          /** @type {() => V} */
          fallback
        );
        return get(fallback_signal);
      }
      if (fallback_dirty) {
        fallback_dirty = false;
        fallback_value = lazy ? untrack(
          /** @type {() => V} */
          fallback
        ) : (
          /** @type {V} */
          fallback
        );
      }
      return fallback_value;
    };
    let setter;
    if (bindable) {
      var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
      setter = get_descriptor(props, key)?.set ?? (is_entry_props && key in props ? (v) => props[key] = v : void 0);
    }
    var initial_value;
    var is_store_sub = false;
    if (bindable) {
      [initial_value, is_store_sub] = capture_store_binding(() => (
        /** @type {V} */
        props[key]
      ));
    } else {
      initial_value = /** @type {V} */
      props[key];
    }
    if (initial_value === void 0 && fallback !== void 0) {
      initial_value = get_fallback();
      if (setter) {
        if (runes) props_invalid_value();
        setter(initial_value);
      }
    }
    var getter;
    if (runes) {
      getter = () => {
        var value = (
          /** @type {V} */
          props[key]
        );
        if (value === void 0) return get_fallback();
        fallback_dirty = true;
        return value;
      };
    } else {
      getter = () => {
        var value = (
          /** @type {V} */
          props[key]
        );
        if (value !== void 0) {
          fallback_value = /** @type {V} */
          void 0;
        }
        return value === void 0 ? fallback_value : value;
      };
    }
    if (runes && (flags2 & PROPS_IS_UPDATED) === 0) {
      return getter;
    }
    if (setter) {
      var legacy_parent = props.$$legacy;
      return (
        /** @type {() => V} */
        (function(value, mutation) {
          if (arguments.length > 0) {
            if (!runes || !mutation || legacy_parent || is_store_sub) {
              setter(mutation ? getter() : value);
            }
            return value;
          }
          return getter();
        })
      );
    }
    var overridden = false;
    var d = ((flags2 & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => {
      overridden = false;
      return getter();
    });
    if (bindable) get(d);
    var parent_effect = (
      /** @type {Effect} */
      active_effect
    );
    return (
      /** @type {() => V} */
      (function(value, mutation) {
        if (arguments.length > 0) {
          const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
          set(d, new_value);
          overridden = true;
          if (fallback_value !== void 0) {
            fallback_value = new_value;
          }
          return value;
        }
        if (is_destroying_effect && overridden || (parent_effect.f & DESTROYED) !== 0) {
          return d.v;
        }
        return get(d);
      })
    );
  }
  function onMount(fn) {
    if (component_context === null) {
      lifecycle_outside_component();
    }
    if (legacy_mode_flag && component_context.l !== null) {
      init_update_callbacks(component_context).m.push(fn);
    } else {
      user_effect(() => {
        const cleanup = untrack(fn);
        if (typeof cleanup === "function") return (
          /** @type {() => void} */
          cleanup
        );
      });
    }
  }
  function init_update_callbacks(context) {
    var l = (
      /** @type {ComponentContextLegacy} */
      context.l
    );
    return l.u ??= { a: [], b: [], m: [] };
  }
  const PUBLIC_VERSION = "5";
  if (typeof window !== "undefined") {
    ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(PUBLIC_VERSION);
  }
  enable_legacy_mode_flag();
  function defaultBookingInterface(defaultMode = "custom", locale = "en") {
    const periods = locale.toLowerCase().startsWith("cs") ? ["Ráno", "Odpoledne", "Celý den"] : ["Morning", "Afternoon", "Full day"];
    return {
      default_mode: defaultMode,
      whole_day_start_time: "12:00",
      whole_day_end_time: "12:00",
      resource_slots: [
        { id: "morning", label: periods[0], start_time: "08:00", end_time: "12:00" },
        { id: "afternoon", label: periods[1], start_time: "12:00", end_time: "18:00" },
        { id: "full-day", label: periods[2], start_time: "08:00", end_time: "18:00" }
      ]
    };
  }
  function bookingInterfaceFor(value, locale = "en") {
    const defaults = defaultBookingInterface("custom", locale);
    return {
      default_mode: value?.default_mode === "simple" ? "simple" : "custom",
      whole_day_start_time: value?.whole_day_start_time || defaults.whole_day_start_time,
      whole_day_end_time: value?.whole_day_end_time || defaults.whole_day_end_time,
      resource_slots: Array.isArray(value?.resource_slots) && value.resource_slots.length > 0 ? value.resource_slots : defaults.resource_slots
    };
  }
  function toInstant(localValue, zone, messages = {}) {
    if (!localValue) throw new Error(messages.missing || "Enter both start and end times.");
    const [date, time] = localValue.split("T");
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const wallTime = Date.UTC(year, month - 1, day, hour, minute);
    let candidate = wallTime;
    const format = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const partsAt = (instant) => format.formatToParts(new Date(instant)).reduce((out, item) => {
      if (item.type !== "literal") out[item.type] = Number(item.value);
      return out;
    }, {});
    for (let i = 0; i < 3; i += 1) {
      const parts2 = partsAt(candidate);
      candidate += wallTime - Date.UTC(parts2.year, parts2.month - 1, parts2.day, parts2.hour, parts2.minute);
    }
    const parts = partsAt(candidate);
    if (parts.year !== year || parts.month !== month || parts.day !== day || parts.hour !== hour || parts.minute !== minute) {
      throw new Error(messages.daylightSaving || "This local time does not exist because of a daylight saving time change.");
    }
    return new Date(candidate).toISOString();
  }
  function toLocalInput(instant, zone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date(instant)).reduce((out, item) => {
      if (item.type !== "literal") out[item.type] = item.value;
      return out;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  }
  function formatDate(value, zone, locale = "en-GB") {
    if (!value) return "—";
    try {
      return new Intl.DateTimeFormat(locale, {
        timeZone: zone || void 0,
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(value));
    } catch {
      return new Date(value).toLocaleString(locale);
    }
  }
  function getAdminLocale() {
    return window.__GRAV_I18N?.locale || document.documentElement.lang || "en";
  }
  function translate(locale, key, values) {
    const bridge = window.__GRAV_I18N;
    return bridge?.t?.(key, values) || key;
  }
  function dateLocale(locale) {
    const normalized = locale.toLowerCase().replace("_", "-");
    if (normalized === "cs" || normalized.startsWith("cs-")) return "cs-CZ";
    if (normalized === "en" || normalized.startsWith("en-")) return normalized;
    return "en-GB";
  }
  function weekdayName(locale, index2, short = false) {
    const date = new Date(Date.UTC(2024, 0, 1 + index2));
    return new Intl.DateTimeFormat(dateLocale(locale), { weekday: short ? "short" : "long", timeZone: "UTC" }).format(date);
  }
  var root$3 = /* @__PURE__ */ from_html(`<option> </option>`);
  var root_1$3 = /* @__PURE__ */ from_html(`<label> <select class="form-select" name="resource_id"><option> </option><!></select></label>`);
  var root_2$3 = /* @__PURE__ */ from_html(`<input type="hidden" name="resource_id" value=""/>`);
  var root_3$3 = /* @__PURE__ */ from_html(`<label> <input class="form-control" type="date" required=""/></label> <label> <select class="form-select" required=""><option> </option><!></select></label>`, 1);
  var root_4$3 = /* @__PURE__ */ from_html(`<p class="booking-form-grid__wide booking-simple-help"> </p>`);
  var root_5$3 = /* @__PURE__ */ from_html(`<label> <input class="form-control" type="date" required=""/></label> <label> <input class="form-control" type="date" required=""/></label> <!>`, 1);
  var root_6$3 = /* @__PURE__ */ from_html(`<p class="booking-alert booking-alert--warning" role="alert"> </p>`);
  var root_7$2 = /* @__PURE__ */ from_html(`<div class="booking-form-grid"><!></div> <!> <input type="hidden" name="start"/> <input type="hidden" name="end"/>`, 1);
  var root_8$2 = /* @__PURE__ */ from_html(`<div class="booking-form-grid"><label> <input class="form-control" name="start" type="datetime-local" required=""/></label> <label> <input class="form-control" name="end" type="datetime-local" required=""/></label></div>`);
  var root_9$2 = /* @__PURE__ */ from_html(`<label> <select class="form-select" name="status"><option> </option><option> </option></select></label>`);
  var root_10$2 = /* @__PURE__ */ from_html(`<label class="booking-form-grid__wide"> <textarea class="form-control" name="admin_note" maxlength="5000"></textarea></label>`);
  var root_11$1 = /* @__PURE__ */ from_html(`<dialog class="booking-dialog"><form class="booking-dialog__form"><div class="booking-dialog__heading"><div><p class="booking-eyebrow"> </p><h2> </h2></div> <button type="button" class="btn btn-icon btn-secondary">&times;</button></div> <div class="booking-form-grid"><label> <select class="form-select" name="facility_id" required=""><option> </option><!></select></label> <!></div> <fieldset class="booking-entry-mode"><legend> </legend> <label class="form-check"><input class="form-check-input" type="radio" name="entry_mode" value="simple"/> </label> <label class="form-check"><input class="form-check-input" type="radio" name="entry_mode" value="custom"/> </label></fieldset> <!> <div class="booking-form-grid"><label> <input class="form-control" name="customer_name" maxlength="255" required=""/></label> <label> <input class="form-control" name="customer_email" type="email" maxlength="255" required=""/></label> <label> <input class="form-control" name="customer_phone" maxlength="50"/></label> <!> <label class="booking-form-grid__wide"> <textarea class="form-control" name="customer_note" maxlength="5000"></textarea></label> <!></div> <div class="booking-dialog__actions"><button type="button" class="btn btn-secondary"> </button> <button class="btn btn-primary" type="submit"><i class="fa fa-check" aria-hidden="true"></i> </button></div></form></dialog>`);
  function BookingDialog($$anchor, $$props) {
    push($$props, false);
    let open = prop($$props, "open", 8, false);
    let booking = prop($$props, "booking", 8, null);
    let facilities = prop($$props, "facilities", 24, () => []);
    let locale = prop($$props, "locale", 8, "en");
    let onSave = prop($$props, "onSave", 8);
    let onClose = prop($$props, "onClose", 8);
    let dialog = /* @__PURE__ */ mutable_source();
    let formElement = /* @__PURE__ */ mutable_source();
    let hydratedBooking = /* @__PURE__ */ mutable_source("");
    let facilityId = /* @__PURE__ */ mutable_source("");
    let resourceId = /* @__PURE__ */ mutable_source("");
    let start = /* @__PURE__ */ mutable_source("");
    let end = /* @__PURE__ */ mutable_source("");
    let entryMode = /* @__PURE__ */ mutable_source("custom");
    let checkInDate = /* @__PURE__ */ mutable_source("");
    let checkOutDate = /* @__PURE__ */ mutable_source("");
    let resourceSlotId = /* @__PURE__ */ mutable_source("");
    let selectedFacility = /* @__PURE__ */ mutable_source();
    let bookingInterface = /* @__PURE__ */ mutable_source(bookingInterfaceFor());
    let usesResourceSlots = /* @__PURE__ */ mutable_source(false);
    let selectedSlot = /* @__PURE__ */ mutable_source();
    let simpleRange = /* @__PURE__ */ mutable_source({ start: "", end: "" });
    let simpleError = /* @__PURE__ */ mutable_source("");
    const tr = (key) => translate(locale(), `PLUGIN_BOOKING.ADMIN.UI.${key}`);
    function isResourceBooking(facility, selectedResource) {
      return facility?.booking_mode === "resources" || facility?.booking_mode === "both" && Boolean(selectedResource);
    }
    function makeSimpleRange(facility, config, resourceBooking, firstDate, lastDate, slot) {
      if (!facility || !firstDate) return { start: "", end: "" };
      if (resourceBooking) {
        if (!slot) return { start: "", end: "" };
        return {
          start: `${firstDate}T${slot.start_time}`,
          end: `${firstDate}T${slot.end_time}`
        };
      }
      if (!lastDate) return { start: "", end: "" };
      return {
        start: `${firstDate}T${config.whole_day_start_time}`,
        end: `${lastDate}T${config.whole_day_end_time}`
      };
    }
    function validateSimpleRange(range, facility) {
      if (!range.start || !range.end || !facility) return "";
      try {
        const startInstant = toInstant(range.start, facility.timezone, {
          missing: tr("ENTER_START_AND_END"),
          daylightSaving: tr("DAYLIGHT_SAVING_GAP")
        });
        const endInstant = toInstant(range.end, facility.timezone, {
          missing: tr("ENTER_START_AND_END"),
          daylightSaving: tr("DAYLIGHT_SAVING_GAP")
        });
        const duration = (Date.parse(endInstant) - Date.parse(startInstant)) / 1e3;
        if (duration <= 0) return tr("CHECKOUT_AFTER_CHECKIN");
        const rules = facility.booking_rules;
        if (rules?.minimum_duration_seconds && duration < rules.minimum_duration_seconds) return tr("SIMPLE_SLOT_TOO_SHORT");
        if (rules?.maximum_duration_seconds && duration > rules.maximum_duration_seconds) return tr("SIMPLE_SLOT_TOO_LONG");
      } catch (error) {
        return error instanceof Error ? error.message : tr("INVALID_SIMPLE_TIME");
      }
      return "";
    }
    function nextDate(date) {
      if (!date) return "";
      const [year, month, day] = date.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
    }
    function facilityChanged(event2) {
      set(facilityId, event2.currentTarget.value);
      set(resourceId, "");
      set(checkInDate, "");
      set(checkOutDate, "");
      set(start, "");
      set(end, "");
      const facility = facilities().find((item) => item.id === get(facilityId));
      const config = bookingInterfaceFor(facility?.booking_interface, locale());
      set(resourceSlotId, config.resource_slots[0]?.id || "");
      set(entryMode, config.default_mode);
    }
    function close() {
      set(hydratedBooking, "");
      onClose()();
    }
    function submit(event2) {
      event2.preventDefault();
      const form = event2.currentTarget;
      void onSave()(new FormData(form));
    }
    legacy_pre_effect(
      () => (get(dialog), get(formElement), deep_read_state(open()), get(hydratedBooking), deep_read_state(booking()), get(facilityId), deep_read_state(facilities()), get(resourceId), deep_read_state(locale()), get(start), get(end), get(checkInDate), get(checkOutDate)),
      () => {
        if (get(dialog) && get(formElement) && open() && get(hydratedBooking) !== (booking()?.id || "new")) {
          set(hydratedBooking, booking()?.id || "new");
          get(formElement).reset();
          set(facilityId, booking()?.facility_id || facilities()[0]?.id || "");
          set(resourceId, booking()?.resource_id || "");
          const facility = facilities().find((item) => item.id === get(facilityId));
          const config = bookingInterfaceFor(facility?.booking_interface, locale());
          const timeZone = booking()?.timezone || facility?.timezone || "UTC";
          if (booking()) {
            set(start, toLocalInput(booking().start, timeZone));
            set(end, toLocalInput(booking().end, timeZone));
            set(checkInDate, get(start).slice(0, 10));
            set(checkOutDate, get(end).slice(0, 10));
            set(resourceSlotId, "");
            const usesRoom = isResourceBooking(facility, get(resourceId));
            const matchingSlot = usesRoom && get(checkInDate) === get(checkOutDate) ? config.resource_slots.find((slot) => slot.start_time === get(start).slice(11, 16) && slot.end_time === get(end).slice(11, 16)) : void 0;
            if (matchingSlot) {
              set(resourceSlotId, matchingSlot.id);
              set(entryMode, "simple");
            } else if (!usesRoom && get(checkOutDate) > get(checkInDate) && get(start).slice(11, 16) === config.whole_day_start_time && get(end).slice(11, 16) === config.whole_day_end_time) {
              set(entryMode, "simple");
            } else {
              set(resourceSlotId, config.resource_slots[0]?.id || "");
              set(entryMode, "custom");
            }
          } else {
            set(start, "");
            set(end, "");
            set(checkInDate, "");
            set(checkOutDate, "");
            set(resourceSlotId, config.resource_slots[0]?.id || "");
            set(entryMode, config.default_mode);
          }
        }
      }
    );
    legacy_pre_effect(() => (deep_read_state(facilities()), get(facilityId)), () => {
      set(selectedFacility, facilities().find((facility) => facility.id === get(facilityId)));
    });
    legacy_pre_effect(
      () => (get(selectedFacility), deep_read_state(locale())),
      () => {
        set(bookingInterface, bookingInterfaceFor(get(selectedFacility)?.booking_interface, locale()));
      }
    );
    legacy_pre_effect(() => (get(selectedFacility), get(resourceId)), () => {
      set(usesResourceSlots, get(selectedFacility)?.booking_mode === "resources" || get(selectedFacility)?.booking_mode === "both" && Boolean(get(resourceId)));
    });
    legacy_pre_effect(() => (get(bookingInterface), get(resourceSlotId)), () => {
      set(selectedSlot, get(bookingInterface).resource_slots.find((slot) => slot.id === get(resourceSlotId)));
    });
    legacy_pre_effect(
      () => (get(selectedFacility), get(bookingInterface), get(usesResourceSlots), get(checkInDate), get(checkOutDate), get(selectedSlot)),
      () => {
        set(simpleRange, makeSimpleRange(get(selectedFacility), get(bookingInterface), get(usesResourceSlots), get(checkInDate), get(checkOutDate), get(selectedSlot)));
      }
    );
    legacy_pre_effect(
      () => (get(entryMode), get(simpleRange), get(selectedFacility)),
      () => {
        set(simpleError, get(entryMode) === "simple" ? validateSimpleRange(get(simpleRange), get(selectedFacility)) : "");
      }
    );
    legacy_pre_effect(() => (get(dialog), deep_read_state(open())), () => {
      if (get(dialog) && open() && !get(dialog).open) get(dialog).showModal();
    });
    legacy_pre_effect(() => (get(dialog), deep_read_state(open())), () => {
      if (get(dialog) && !open() && get(dialog).open) get(dialog).close();
    });
    legacy_pre_effect_reset();
    init();
    var dialog_1 = root_11$1();
    var form_1 = child(dialog_1);
    var div = child(form_1);
    var div_1 = child(div);
    var p = child(div_1);
    var text2 = only_child(p, true);
    var h2 = sibling(p);
    var text_1 = only_child(h2, true);
    var button = sibling(div_1, 2);
    var div_2 = sibling(div, 2);
    var label = child(div_2);
    var text_2 = child(label);
    var select = sibling(text_2);
    var option = child(select);
    var text_3 = only_child(option, true);
    option.value = option.__value = "";
    var node = sibling(option);
    each(node, 1, facilities, (facility) => facility.id, ($$anchor2, facility) => {
      var option_1 = root$3();
      var text_4 = only_child(option_1, true);
      var option_1_value = {};
      template_effect(() => {
        set_text(text_4, (get(facility), untrack(() => get(facility).name)));
        if (option_1_value !== (option_1_value = (get(facility), untrack(() => get(facility).id)))) {
          option_1.value = (option_1.__value = option_1_value) ?? "";
        }
      });
      append($$anchor2, option_1);
    });
    var select_value;
    init_select(select);
    var node_1 = sibling(label, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var label_1 = root_1$3();
        var text_5 = child(label_1);
        var select_1 = sibling(text_5);
        var option_2 = child(select_1);
        var text_6 = only_child(option_2, true);
        option_2.value = option_2.__value = "";
        var node_2 = sibling(option_2);
        each(
          node_2,
          1,
          () => (get(selectedFacility), untrack(() => get(selectedFacility)?.resources || [])),
          (resource) => resource.id,
          ($$anchor3, resource) => {
            var fragment = comment();
            var node_3 = first_child(fragment);
            {
              var consequent = ($$anchor4) => {
                var option_3 = root$3();
                var text_7 = only_child(option_3, true);
                var option_3_value = {};
                template_effect(() => {
                  set_text(text_7, (get(resource), untrack(() => get(resource).name)));
                  if (option_3_value !== (option_3_value = (get(resource), untrack(() => get(resource).id)))) {
                    option_3.value = (option_3.__value = option_3_value) ?? "";
                  }
                });
                append($$anchor4, option_3);
              };
              if_block(node_3, ($$render) => {
                if (get(resource), untrack(() => get(resource).enabled !== false)) $$render(consequent);
              });
            }
            append($$anchor3, fragment);
          }
        );
        init_select(select_1);
        template_effect(
          ($0, $1) => {
            set_text(text_5, `${$0 ?? ""} `);
            select_1.required = (get(selectedFacility), untrack(() => get(selectedFacility)?.booking_mode === "resources"));
            set_text(text_6, $1);
          },
          [
            () => untrack(() => tr("ROOM_OR_RESOURCE")),
            () => (get(selectedFacility), untrack(() => get(selectedFacility)?.booking_mode === "resources" ? tr("CHOOSE_ROOM") : tr("FACILITY_BOOKING")))
          ]
        );
        bind_select_value(select_1, () => get(resourceId), ($$value) => set(resourceId, $$value));
        append($$anchor2, label_1);
      };
      var alternate = ($$anchor2) => {
        var input = root_2$3();
        append($$anchor2, input);
      };
      if_block(node_1, ($$render) => {
        if (get(selectedFacility), untrack(() => get(selectedFacility)?.booking_mode !== "facility")) $$render(consequent_1);
        else $$render(alternate, -1);
      });
    }
    var fieldset = sibling(div_2, 2);
    var legend = child(fieldset);
    var text_8 = only_child(legend, true);
    var label_2 = sibling(legend, 2);
    var input_1 = child(label_2);
    var text_9 = sibling(input_1, 1, true);
    var label_3 = sibling(label_2, 2);
    var input_2 = child(label_3);
    var text_10 = sibling(input_2, 1, true);
    var node_4 = sibling(fieldset, 2);
    {
      var consequent_5 = ($$anchor2) => {
        var fragment_1 = root_7$2();
        var div_3 = first_child(fragment_1);
        var node_5 = child(div_3);
        {
          var consequent_2 = ($$anchor3) => {
            var fragment_2 = root_3$3();
            var label_4 = first_child(fragment_2);
            var text_11 = child(label_4);
            var input_3 = sibling(text_11);
            var label_5 = sibling(label_4, 2);
            var text_12 = child(label_5);
            var select_2 = sibling(text_12);
            var option_4 = child(select_2);
            var text_13 = only_child(option_4, true);
            option_4.value = option_4.__value = "";
            var node_6 = sibling(option_4);
            each(
              node_6,
              1,
              () => (get(bookingInterface), untrack(() => get(bookingInterface).resource_slots)),
              (slot) => slot.id,
              ($$anchor4, slot) => {
                var option_5 = root$3();
                var text_14 = only_child(option_5);
                var option_5_value = {};
                template_effect(() => {
                  set_text(text_14, `${(get(slot), untrack(() => get(slot).label)) ?? ""} (${(get(slot), untrack(() => get(slot).start_time)) ?? ""}–${(get(slot), untrack(() => get(slot).end_time)) ?? ""})`);
                  if (option_5_value !== (option_5_value = (get(slot), untrack(() => get(slot).id)))) {
                    option_5.value = (option_5.__value = option_5_value) ?? "";
                  }
                });
                append($$anchor4, option_5);
              }
            );
            init_select(select_2);
            template_effect(
              ($0, $1, $2) => {
                set_text(text_11, $0);
                set_text(text_12, `${$1 ?? ""} `);
                set_text(text_13, $2);
              },
              [
                () => untrack(() => tr("BOOKING_DATE")),
                () => untrack(() => tr("BOOKING_PERIOD")),
                () => untrack(() => tr("CHOOSE_PERIOD"))
              ]
            );
            bind_value(input_3, () => get(checkInDate), ($$value) => set(checkInDate, $$value));
            bind_select_value(select_2, () => get(resourceSlotId), ($$value) => set(resourceSlotId, $$value));
            append($$anchor3, fragment_2);
          };
          var alternate_1 = ($$anchor3) => {
            var fragment_3 = root_5$3();
            var label_6 = first_child(fragment_3);
            var text_15 = child(label_6);
            var input_4 = sibling(text_15);
            var label_7 = sibling(label_6, 2);
            var text_16 = child(label_7);
            var input_5 = sibling(text_16);
            var node_7 = sibling(label_7, 2);
            {
              var consequent_3 = ($$anchor4) => {
                var p_1 = root_4$3();
                var text_17 = only_child(p_1);
                template_effect(
                  ($0) => set_text(text_17, `${$0 ?? ""} ${(get(bookingInterface), untrack(() => get(bookingInterface).whole_day_start_time)) ?? ""} – ${(get(bookingInterface), untrack(() => get(bookingInterface).whole_day_end_time)) ?? ""}`),
                  [() => untrack(() => tr("WHOLE_DAY_TIME_HELP"))]
                );
                append($$anchor4, p_1);
              };
              if_block(node_7, ($$render) => {
                if (get(selectedFacility)) $$render(consequent_3);
              });
            }
            template_effect(
              ($0, $1, $2) => {
                set_text(text_15, $0);
                set_text(text_16, $1);
                set_attribute(input_5, "min", $2);
              },
              [
                () => untrack(() => tr("CHECK_IN_DATE")),
                () => untrack(() => tr("CHECK_OUT_DATE")),
                () => (get(checkInDate), untrack(() => nextDate(get(checkInDate))))
              ]
            );
            bind_value(input_4, () => get(checkInDate), ($$value) => set(checkInDate, $$value));
            bind_value(input_5, () => get(checkOutDate), ($$value) => set(checkOutDate, $$value));
            append($$anchor3, fragment_3);
          };
          if_block(node_5, ($$render) => {
            if (get(usesResourceSlots)) $$render(consequent_2);
            else $$render(alternate_1, -1);
          });
        }
        var node_8 = sibling(div_3, 2);
        {
          var consequent_4 = ($$anchor3) => {
            var p_2 = root_6$3();
            var text_18 = only_child(p_2, true);
            template_effect(() => set_text(text_18, get(simpleError)));
            append($$anchor3, p_2);
          };
          if_block(node_8, ($$render) => {
            if (get(simpleError)) $$render(consequent_4);
          });
        }
        var input_6 = sibling(node_8, 2);
        var input_7 = sibling(input_6, 2);
        template_effect(() => {
          set_value(input_6, (get(simpleRange), untrack(() => get(simpleRange).start)));
          set_value(input_7, (get(simpleRange), untrack(() => get(simpleRange).end)));
        });
        append($$anchor2, fragment_1);
      };
      var alternate_2 = ($$anchor2) => {
        var div_4 = root_8$2();
        var label_8 = child(div_4);
        var text_19 = child(label_8);
        var input_8 = sibling(text_19);
        var label_9 = sibling(label_8, 2);
        var text_20 = child(label_9);
        var input_9 = sibling(text_20);
        template_effect(
          ($0, $1) => {
            set_text(text_19, $0);
            set_text(text_20, $1);
          },
          [
            () => untrack(() => tr("START")),
            () => untrack(() => tr("END"))
          ]
        );
        bind_value(input_8, () => get(start), ($$value) => set(start, $$value));
        bind_value(input_9, () => get(end), ($$value) => set(end, $$value));
        append($$anchor2, div_4);
      };
      if_block(node_4, ($$render) => {
        if (get(entryMode) === "simple") $$render(consequent_5);
        else $$render(alternate_2, -1);
      });
    }
    var div_5 = sibling(node_4, 2);
    var label_10 = child(div_5);
    var text_21 = child(label_10);
    var input_10 = sibling(text_21);
    var label_11 = sibling(label_10, 2);
    var text_22 = child(label_11);
    var input_11 = sibling(text_22);
    var label_12 = sibling(label_11, 2);
    var text_23 = child(label_12);
    var input_12 = sibling(text_23);
    var node_9 = sibling(label_12, 2);
    {
      var consequent_6 = ($$anchor2) => {
        var label_13 = root_9$2();
        var text_24 = child(label_13);
        var select_3 = sibling(text_24);
        var option_6 = child(select_3);
        var text_25 = only_child(option_6, true);
        option_6.value = option_6.__value = "pending";
        var option_7 = sibling(option_6);
        var text_26 = only_child(option_7, true);
        option_7.value = option_7.__value = "confirmed";
        template_effect(
          ($0, $1, $2) => {
            set_text(text_24, `${$0 ?? ""} `);
            set_text(text_25, $1);
            set_text(text_26, $2);
          },
          [
            () => untrack(() => tr("STATUS")),
            () => untrack(() => tr("PENDING_APPROVAL")),
            () => (deep_read_state(translate), deep_read_state(locale()), untrack(() => translate(locale(), "PLUGIN_BOOKING.ADMIN.STATUS_CONFIRMED")))
          ]
        );
        append($$anchor2, label_13);
      };
      if_block(node_9, ($$render) => {
        if (!booking()) $$render(consequent_6);
      });
    }
    var label_14 = sibling(node_9, 2);
    var text_27 = child(label_14);
    var textarea = sibling(text_27);
    var node_10 = sibling(label_14, 2);
    {
      var consequent_7 = ($$anchor2) => {
        var label_15 = root_10$2();
        var text_28 = child(label_15);
        var textarea_1 = sibling(text_28);
        template_effect(
          ($0) => {
            set_text(text_28, $0);
            set_value(textarea_1, (deep_read_state(booking()), untrack(() => booking().admin_note || "")));
          },
          [() => untrack(() => tr("ADMINISTRATOR_NOTE"))]
        );
        append($$anchor2, label_15);
      };
      if_block(node_10, ($$render) => {
        if (booking()) $$render(consequent_7);
      });
    }
    var div_6 = sibling(div_5, 2);
    var button_1 = child(div_6);
    var text_29 = only_child(button_1, true);
    var button_2 = sibling(button_1, 2);
    var text_30 = sibling(child(button_2));
    bind_this(form_1, ($$value) => set(formElement, $$value), () => get(formElement));
    bind_this(dialog_1, ($$value) => set(dialog, $$value), () => get(dialog));
    template_effect(
      ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) => {
        set_attribute(dialog_1, "lang", locale());
        set_text(text2, $0);
        set_text(text_1, $1);
        set_attribute(button, "aria-label", $2);
        set_text(text_2, `${$3 ?? ""} `);
        set_text(text_3, $4);
        if (select_value !== (select_value = get(facilityId))) {
          select.value = (select.__value = select_value) ?? "", select_option(select, select_value);
        }
        set_text(text_8, $5);
        set_checked(input_1, get(entryMode) === "simple");
        set_text(text_9, $6);
        set_checked(input_2, get(entryMode) === "custom");
        set_text(text_10, $7);
        set_text(text_21, $8);
        set_value(input_10, (deep_read_state(booking()), untrack(() => booking()?.customer_name || "")));
        set_text(text_22, $9);
        set_value(input_11, (deep_read_state(booking()), untrack(() => booking()?.customer_email || "")));
        set_text(text_23, $10);
        set_value(input_12, (deep_read_state(booking()), untrack(() => booking()?.customer_phone || "")));
        set_text(text_27, $11);
        set_value(textarea, (deep_read_state(booking()), untrack(() => booking()?.customer_note || "")));
        set_text(text_29, $12);
        button_2.disabled = $13;
        set_text(text_30, ` ${$14 ?? ""}`);
      },
      [
        () => untrack(() => tr("BOOKING")),
        () => (deep_read_state(booking()), untrack(() => booking() ? tr("EDIT_BOOKING") : tr("NEW_BOOKING"))),
        () => untrack(() => tr("CLOSE")),
        () => untrack(() => tr("FACILITY")),
        () => untrack(() => tr("CHOOSE_FACILITY")),
        () => untrack(() => tr("BOOKING_TIME_MODE")),
        () => untrack(() => tr("SIMPLE_MODE")),
        () => untrack(() => tr("CUSTOM_MODE")),
        () => untrack(() => tr("REQUESTER_NAME")),
        () => untrack(() => tr("REQUESTER_EMAIL")),
        () => untrack(() => tr("PHONE")),
        () => untrack(() => tr("REQUESTER_NOTE")),
        () => untrack(() => tr("CANCEL")),
        () => (get(entryMode), get(simpleRange), get(simpleError), untrack(() => get(entryMode) === "simple" && (!get(simpleRange).start || !get(simpleRange).end || Boolean(get(simpleError))))),
        () => untrack(() => tr("SAVE_BOOKING"))
      ]
    );
    event("close", dialog_1, close);
    event("submit", form_1, submit);
    delegated("click", button, close);
    delegated("change", select, facilityChanged);
    delegated("change", input_1, () => set(entryMode, "simple"));
    delegated("change", input_2, () => set(entryMode, "custom"));
    delegated("click", button_1, close);
    append($$anchor, dialog_1);
    pop();
  }
  delegate(["click", "change"]);
  var root$2 = /* @__PURE__ */ from_html(`<span class="booking-calendar__legend-item"><span aria-hidden="true"></span> </span>`);
  var root_1$2 = /* @__PURE__ */ from_html(`<p class="booking-calendar__loading" role="status"> </p>`);
  var root_2$2 = /* @__PURE__ */ from_html(`<button type="button"><strong> </strong> <span> </span> <span> </span> <span class="booking-calendar__event-status"> </span></button>`);
  var root_3$2 = /* @__PURE__ */ from_html(`<section class="booking-calendar__month-bookings"><div class="booking-calendar__month-bookings-heading"><strong> </strong><span> </span></div> <div class="booking-calendar__month-bookings-list"></div></section>`);
  var root_4$2 = /* @__PURE__ */ from_html(`<span> </span>`);
  var root_5$2 = /* @__PURE__ */ from_html(`<span class="booking-calendar__day-count"> </span>`);
  var root_6$2 = /* @__PURE__ */ from_html(`<button type="button"><span class="booking-calendar__event-title"><strong> </strong> </span> <span class="booking-calendar__event-place"> </span> <span class="booking-calendar__event-status"> </span></button>`);
  var root_7$1 = /* @__PURE__ */ from_html(`<div class="booking-calendar__events"></div>`);
  var root_8$1 = /* @__PURE__ */ from_html(`<span class="booking-calendar__empty-day"> </span>`);
  var root_9$1 = /* @__PURE__ */ from_html(`<div><div class="booking-calendar__day-heading"><span> </span><!></div> <!></div>`);
  var root_10$1 = /* @__PURE__ */ from_html(`<section class="booking-calendar"><div class="booking-calendar__heading"><div class="booking-calendar__month-nav"><button class="btn btn-secondary" type="button"><i class="fa fa-chevron-left" aria-hidden="true"></i></button> <h3> </h3> <button class="btn btn-secondary" type="button"><i class="fa fa-chevron-right" aria-hidden="true"></i></button> <button class="btn btn-secondary" type="button"> </button></div> <div class="booking-calendar__legend"></div></div> <!> <!> <div class="booking-calendar__scroll"><div class="booking-calendar__weekdays" aria-hidden="true"></div> <div class="booking-calendar__grid"></div></div></section>`);
  function BookingCalendar($$anchor, $$props) {
    push($$props, false);
    let bookings = prop($$props, "bookings", 24, () => []);
    let loading = prop($$props, "loading", 8, false);
    let month = prop($$props, "month", 24, () => new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1));
    let locale = prop($$props, "locale", 8, "en");
    let statusLabel = prop($$props, "statusLabel", 8);
    let onMonthChange = prop($$props, "onMonthChange", 8);
    let onToday = prop($$props, "onToday", 8);
    let onSelectBooking = prop($$props, "onSelectBooking", 8);
    let days = /* @__PURE__ */ mutable_source([]);
    let entries = /* @__PURE__ */ mutable_source([]);
    let monthEntries = /* @__PURE__ */ mutable_source([]);
    let eventsByDay = /* @__PURE__ */ mutable_source(/* @__PURE__ */ new Map());
    let weekdays = /* @__PURE__ */ mutable_source([]);
    let monthLabel = /* @__PURE__ */ mutable_source("");
    let todayKey = /* @__PURE__ */ mutable_source("");
    const tr = (key) => translate(locale(), `PLUGIN_BOOKING.ADMIN.UI.${key}`);
    function dateKey(date) {
      const year = date.getFullYear();
      const monthNumber = String(date.getMonth() + 1).padStart(2, "0");
      const dayNumber = String(date.getDate()).padStart(2, "0");
      return `${year}-${monthNumber}-${dayNumber}`;
    }
    function buildCalendarDays(value) {
      const year = value.getFullYear();
      const monthIndex = value.getMonth();
      const firstDay = new Date(year, monthIndex, 1);
      const mondayOffset = (firstDay.getDay() + 6) % 7;
      const monthLength = new Date(year, monthIndex + 1, 0).getDate();
      const cellCount = Math.ceil((mondayOffset + monthLength) / 7) * 7;
      return Array.from({ length: cellCount }, (_, index2) => {
        const date = new Date(year, monthIndex, 1 - mondayOffset + index2);
        return {
          date: dateKey(date),
          day: date.getDate(),
          inMonth: date.getMonth() === monthIndex
        };
      });
    }
    function localDateTime(value, timezone) {
      try {
        return toLocalInput(value, timezone);
      } catch {
        return value.replace(/Z$/, "").slice(0, 16);
      }
    }
    function previousDateKey(value) {
      const [year, monthNumber, dayNumber] = value.split("-").map(Number);
      return dateKey(new Date(year, monthNumber - 1, dayNumber - 1));
    }
    function toCalendarEntry(booking) {
      const timezone = booking.timezone || "UTC";
      const start = localDateTime(booking.start, timezone);
      const end = localDateTime(booking.end, timezone);
      const startDate = start.slice(0, 10);
      const endDate = end.slice(0, 10);
      const lastDate = end.slice(11, 16) === "00:00" && endDate > startDate ? previousDateKey(endDate) : endDate;
      return { booking, start, end, startDate, lastDate };
    }
    function buildEventsByDay(calendarDays, calendarEntries) {
      const result = /* @__PURE__ */ new Map();
      for (const day of calendarDays) {
        result.set(day.date, calendarEntries.filter((entry) => entry.startDate <= day.date && entry.lastDate >= day.date).sort((first, second) => first.start.localeCompare(second.start)));
      }
      return result;
    }
    function timeLabel(entry, date) {
      if (entry.startDate === date && entry.lastDate === date) return `${entry.start.slice(11, 16)}–${entry.end.slice(11, 16)}`;
      if (entry.startDate === date) return `${entry.start.slice(11, 16)} →`;
      if (entry.lastDate === date) return `← ${entry.end.slice(11, 16)}`;
      return "↔";
    }
    function bookingTitle(entry) {
      const booking = entry.booking;
      const place = booking.resource_name ? `${booking.facility_name} · ${booking.resource_name}` : booking.facility_name;
      return `${entry.start.slice(0, 16).replace("T", " ")} – ${entry.end.slice(0, 16).replace("T", " ")} · ${booking.customer_name} · ${place} · ${statusLabel()(booking.status)}`;
    }
    function summaryDate(entry) {
      const formatter = new Intl.DateTimeFormat(dateLocale(locale()), {
        month: "short",
        day: "numeric",
        timeZone: entry.booking.timezone || "UTC"
      });
      const start = formatter.format(new Date(entry.booking.start));
      const end = formatter.format(new Date(entry.booking.end));
      return start === end ? start : `${start} – ${end}`;
    }
    function bookingAriaLabel(entry, date) {
      return `${bookingTitle(entry)} · ${date}`;
    }
    legacy_pre_effect(() => deep_read_state(month()), () => {
      set(days, buildCalendarDays(month()));
    });
    legacy_pre_effect(() => deep_read_state(bookings()), () => {
      set(entries, bookings().map(toCalendarEntry));
    });
    legacy_pre_effect(() => (get(entries), deep_read_state(month())), () => {
      set(monthEntries, get(entries).filter((entry) => entry.startDate < dateKey(new Date(month().getFullYear(), month().getMonth() + 1, 1)) && entry.lastDate >= dateKey(new Date(month().getFullYear(), month().getMonth(), 1))).sort((first, second) => first.start.localeCompare(second.start)));
    });
    legacy_pre_effect(() => (get(days), get(entries)), () => {
      set(eventsByDay, buildEventsByDay(get(days), get(entries)));
    });
    legacy_pre_effect(() => deep_read_state(locale()), () => {
      set(weekdays, Array.from({ length: 7 }, (_, index2) => weekdayName(locale(), index2, true)));
    });
    legacy_pre_effect(
      () => (deep_read_state(locale()), deep_read_state(month())),
      () => {
        set(monthLabel, new Intl.DateTimeFormat(dateLocale(locale()), { month: "long", year: "numeric" }).format(month()));
      }
    );
    legacy_pre_effect(() => {
    }, () => {
      set(todayKey, dateKey(/* @__PURE__ */ new Date()));
    });
    legacy_pre_effect_reset();
    init();
    var section = root_10$1();
    var div = child(section);
    var div_1 = child(div);
    var button = child(div_1);
    var h3 = sibling(button, 2);
    var text2 = only_child(h3, true);
    var button_1 = sibling(h3, 2);
    var button_2 = sibling(button_1, 2);
    var text_1 = only_child(button_2, true);
    var div_2 = sibling(div_1, 2);
    each(
      div_2,
      4,
      () => [
        "confirmed",
        "pending",
        "verification_pending",
        "rejected",
        "cancelled"
      ],
      index,
      ($$anchor2, status) => {
        var span = root$2();
        var span_1 = child(span);
        var text_2 = sibling(span_1, 1, true);
        template_effect(
          ($0) => {
            set_class(span_1, 1, `booking-calendar__legend-dot booking-calendar__legend-dot--${status ?? ""}`);
            set_text(text_2, $0);
          },
          [
            () => (deep_read_state(statusLabel()), untrack(() => statusLabel()(status)))
          ]
        );
        append($$anchor2, span);
      }
    );
    var node = sibling(div, 2);
    {
      var consequent = ($$anchor2) => {
        var p = root_1$2();
        var text_3 = only_child(p, true);
        template_effect(($0) => set_text(text_3, $0), [() => untrack(() => tr("LOADING_CALENDAR"))]);
        append($$anchor2, p);
      };
      if_block(node, ($$render) => {
        if (loading()) $$render(consequent);
      });
    }
    var node_1 = sibling(node, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var section_1 = root_3$2();
        var div_3 = child(section_1);
        var strong = child(div_3);
        var text_4 = only_child(strong, true);
        var span_2 = sibling(strong);
        var text_5 = only_child(span_2, true);
        var div_4 = sibling(div_3, 2);
        each(div_4, 5, () => get(monthEntries), (entry) => entry.booking.id, ($$anchor3, entry) => {
          var button_3 = root_2$2();
          var strong_1 = child(button_3);
          var text_6 = only_child(strong_1, true);
          var span_3 = sibling(strong_1, 2);
          var text_7 = only_child(span_3, true);
          var span_4 = sibling(span_3, 2);
          var text_8 = only_child(span_4);
          var span_5 = sibling(span_4, 2);
          var text_9 = only_child(span_5, true);
          template_effect(
            ($0, $1, $2, $3) => {
              set_class(button_3, 1, `booking-calendar__summary-event booking-calendar__event--${(get(entry), untrack(() => get(entry).booking.status)) ?? ""}`);
              set_attribute(button_3, "title", $0);
              set_attribute(button_3, "aria-label", $1);
              set_text(text_6, $2);
              set_text(text_7, (get(entry), untrack(() => get(entry).booking.customer_name)));
              set_text(text_8, `${(get(entry), untrack(() => get(entry).booking.facility_name)) ?? ""}${(get(entry), untrack(() => get(entry).booking.resource_name ? ` · ${get(entry).booking.resource_name}` : "")) ?? ""}`);
              set_text(text_9, $3);
            },
            [
              () => (get(entry), untrack(() => bookingTitle(get(entry)))),
              () => (get(entry), untrack(() => bookingTitle(get(entry)))),
              () => (get(entry), untrack(() => summaryDate(get(entry)))),
              () => (deep_read_state(statusLabel()), get(entry), untrack(() => statusLabel()(get(entry).booking.status)))
            ]
          );
          delegated("click", button_3, () => onSelectBooking()(get(entry).booking));
          append($$anchor3, button_3);
        });
        template_effect(
          ($0, $1) => {
            set_attribute(section_1, "aria-label", $0);
            set_text(text_4, $1);
            set_text(text_5, (get(monthEntries), untrack(() => get(monthEntries).length)));
          },
          [
            () => untrack(() => tr("BOOKINGS_THIS_MONTH")),
            () => untrack(() => tr("BOOKINGS_THIS_MONTH"))
          ]
        );
        append($$anchor2, section_1);
      };
      if_block(node_1, ($$render) => {
        if (deep_read_state(loading()), get(monthEntries), untrack(() => !loading() && get(monthEntries).length)) $$render(consequent_1);
      });
    }
    var div_5 = sibling(node_1, 2);
    var div_6 = child(div_5);
    each(div_6, 5, () => get(weekdays), index, ($$anchor2, weekday) => {
      var span_6 = root_4$2();
      var text_10 = only_child(span_6, true);
      template_effect(() => set_text(text_10, get(weekday)));
      append($$anchor2, span_6);
    });
    var div_7 = sibling(div_6, 2);
    each(div_7, 5, () => get(days), (day) => day.date, ($$anchor2, day) => {
      const dayBookings = /* @__PURE__ */ derived_safe_equal(() => (get(eventsByDay), get(day), untrack(() => get(eventsByDay).get(get(day).date) || [])));
      var div_8 = root_9$1();
      let classes;
      var div_9 = child(div_8);
      var span_7 = child(div_9);
      var text_11 = only_child(span_7, true);
      var node_2 = sibling(span_7);
      {
        var consequent_2 = ($$anchor3) => {
          var span_8 = root_5$2();
          var text_12 = only_child(span_8, true);
          template_effect(() => set_text(text_12, (deep_read_state(get(dayBookings)), untrack(() => get(dayBookings).length))));
          append($$anchor3, span_8);
        };
        if_block(node_2, ($$render) => {
          if (deep_read_state(get(dayBookings)), untrack(() => get(dayBookings).length)) $$render(consequent_2);
        });
      }
      var node_3 = sibling(div_9, 2);
      {
        var consequent_3 = ($$anchor3) => {
          var div_10 = root_7$1();
          each(div_10, 5, () => get(dayBookings), (entry) => entry.booking.id, ($$anchor4, entry) => {
            var button_4 = root_6$2();
            var span_9 = child(button_4);
            var strong_2 = child(span_9);
            var text_13 = only_child(strong_2, true);
            var text_14 = sibling(strong_2);
            var span_10 = sibling(span_9, 2);
            var text_15 = only_child(span_10);
            var span_11 = sibling(span_10, 2);
            var text_16 = only_child(span_11, true);
            template_effect(
              ($0, $1, $2, $3) => {
                set_class(button_4, 1, `booking-calendar__event booking-calendar__event--${(get(entry), untrack(() => get(entry).booking.status)) ?? ""}`);
                set_attribute(button_4, "title", $0);
                set_attribute(button_4, "aria-label", $1);
                set_text(text_13, $2);
                set_text(text_14, ` ${(get(entry), untrack(() => get(entry).booking.customer_name)) ?? ""}`);
                set_text(text_15, `${(get(entry), untrack(() => get(entry).booking.facility_name)) ?? ""}${(get(entry), untrack(() => get(entry).booking.resource_name ? ` · ${get(entry).booking.resource_name}` : "")) ?? ""}`);
                set_text(text_16, $3);
              },
              [
                () => (get(entry), untrack(() => bookingTitle(get(entry)))),
                () => (get(entry), get(day), untrack(() => bookingAriaLabel(get(entry), get(day).date))),
                () => (get(entry), get(day), untrack(() => timeLabel(get(entry), get(day).date))),
                () => (deep_read_state(statusLabel()), get(entry), untrack(() => statusLabel()(get(entry).booking.status)))
              ]
            );
            delegated("click", button_4, () => onSelectBooking()(get(entry).booking));
            append($$anchor4, button_4);
          });
          append($$anchor3, div_10);
        };
        var consequent_4 = ($$anchor3) => {
          var span_12 = root_8$1();
          var text_17 = only_child(span_12, true);
          template_effect(($0) => set_text(text_17, $0), [() => untrack(() => tr("NO_BOOKINGS_DAY"))]);
          append($$anchor3, span_12);
        };
        if_block(node_3, ($$render) => {
          if (deep_read_state(get(dayBookings)), untrack(() => get(dayBookings).length)) $$render(consequent_3);
          else if (get(day), deep_read_state(loading()), untrack(() => get(day).inMonth && !loading())) $$render(consequent_4, 1);
        });
      }
      template_effect(() => {
        classes = set_class(div_8, 1, "booking-calendar__day", null, classes, {
          "booking-calendar__day--outside": !get(day).inMonth,
          "booking-calendar__day--today": get(day).date === get(todayKey)
        });
        set_text(text_11, (get(day), untrack(() => get(day).day)));
      });
      append($$anchor2, div_8);
    });
    template_effect(
      ($0, $1, $2, $3, $4, $5, $6) => {
        set_attribute(section, "aria-label", $0);
        set_attribute(button, "aria-label", $1);
        set_attribute(button, "title", $2);
        set_text(text2, get(monthLabel));
        set_attribute(button_1, "aria-label", $3);
        set_attribute(button_1, "title", $4);
        set_text(text_1, $5);
        set_attribute(div_2, "aria-label", $6);
      },
      [
        () => untrack(() => tr("BOOKING_CALENDAR")),
        () => untrack(() => tr("PREVIOUS_MONTH")),
        () => untrack(() => tr("PREVIOUS_MONTH")),
        () => untrack(() => tr("NEXT_MONTH")),
        () => untrack(() => tr("NEXT_MONTH")),
        () => untrack(() => tr("TODAY")),
        () => untrack(() => tr("BOOKING_STATUS_LEGEND"))
      ]
    );
    delegated("click", button, () => onMonthChange()(-1));
    delegated("click", button_1, () => onMonthChange()(1));
    delegated("click", button_2, function(...$$args) {
      onToday()?.apply(this, $$args);
    });
    append($$anchor, section);
    pop();
  }
  delegate(["click"]);
  var root$1 = /* @__PURE__ */ from_html(`<button type="button" role="tab"> </button>`);
  var root_1$1 = /* @__PURE__ */ from_html(`<small> </small>`);
  var root_2$1 = /* @__PURE__ */ from_html(`<div class="booking-simple-slot"><input type="hidden" name="simple_slot_id"/> <label> <input class="form-control" name="simple_slot_label" required="" maxlength="80"/></label> <label> <input class="form-control" type="time" name="simple_slot_start" required=""/></label> <label> <input class="form-control" type="time" name="simple_slot_end" required=""/></label> <button class="btn btn-sm btn-danger" type="button"> </button></div>`);
  var root_3$1 = /* @__PURE__ */ from_html(`<label class="form-check-inline"><input class="form-check-input" type="checkbox" name="facility_events"/> </label>`);
  var root_4$1 = /* @__PURE__ */ from_html(`<label class="form-check-inline"><input class="form-check-input" type="checkbox" name="requester_events"/> </label>`);
  var root_5$1 = /* @__PURE__ */ from_html(`<section class="booking-email-template-card"><h5> </h5> <label class="booking-email-field"><span> </span><input class="form-control" maxlength="255"/></label> <label class="booking-email-field"><span> </span><textarea class="form-control booking-email-html" rows="5" maxlength="30000"></textarea></label></section>`);
  var root_6$1 = /* @__PURE__ */ from_html(`<form class="booking-facility-form" novalidate=""><div class="booking-editor__heading"><div><p class="booking-eyebrow"> </p> <h3> </h3></div> <button type="button" class="btn btn-secondary"> </button></div> <div class="booking-tabs booking-facility-tabs" role="tablist"></div> <div id="booking-facility-panel-general" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-general" tabindex="0" data-booking-tab="general"><div class="form-grid"><label> <input class="form-control" name="id" pattern="[a-z0-9-]+"/> <!></label> <label> <input class="form-control" name="name" required="" maxlength="255"/></label> <label> <input class="form-control" name="description" maxlength="1000"/></label> <label> <input class="form-control" name="timezone" required="" placeholder="Europe/Prague"/></label> <label> <select class="form-select" name="booking_mode"><option> </option><option> </option><option> </option></select></label> <label> <select class="form-select" name="approval_mode"><option> </option><option> </option></select></label> <label class="form-check"><input class="form-check-input" type="checkbox" name="enabled"/> </label></div></div> <div id="booking-facility-panel-booking" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-booking" tabindex="0" data-booking-tab="booking"><fieldset><legend> </legend> <div class="form-grid"><label> <select class="form-select" name="booking_default_mode"><option> </option><option> </option></select> <small> </small></label> <label> <input class="form-control" type="time" name="whole_day_start_time" required=""/></label> <label> <input class="form-control" type="time" name="whole_day_end_time" required=""/> <small> </small></label></div> <div class="booking-simple-slots"><div class="booking-simple-slots__heading"><div><strong> </strong><small> </small></div> <button class="btn btn-sm btn-secondary" type="button"><i class="fa fa-plus" aria-hidden="true"></i> </button></div> <!></div></fieldset> <fieldset><legend> </legend> <div class="form-grid"><label> <input class="form-control" type="number" name="minimum_duration" min="1"/></label> <label> <input class="form-control" type="number" name="maximum_duration" min="1"/></label> <label> <input class="form-control" type="number" name="booking_interval" min="1"/></label> <label> <input class="form-control" type="number" name="minimum_notice" min="0"/></label> <label> <input class="form-control" type="number" name="horizon" min="1"/></label></div> <p class="booking-muted"> </p></fieldset></div> <div id="booking-facility-panel-availability" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-availability" tabindex="0" data-booking-tab="availability"><fieldset><legend> </legend> <label> <textarea class="form-control" name="windows" rows="3" required=""></textarea></label> <small> <code>mon 08:00 - fri 18:00</code>.</small></fieldset></div> <div id="booking-facility-panel-resources" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-resources" tabindex="0" data-booking-tab="resources"><fieldset><legend> </legend> <label> <textarea class="form-control booking-resource-input" name="resources" rows="5"></textarea></label> <small><code>id | name | description | allowed groups | instant approval groups | enabled</code><br/> <code>false</code> </small></fieldset></div> <div id="booking-facility-panel-access" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-access" tabindex="0" data-booking-tab="access"><fieldset><legend> </legend> <label class="form-check booking-fieldset-toggle"><input class="form-check-input" type="checkbox" name="guest_requests"/> </label> <div class="form-grid"><label> <input class="form-control" name="allowed_groups"/> <small> </small></label> <label> <input class="form-control" name="instant_groups"/> <small> </small></label></div></fieldset></div> <div id="booking-facility-panel-notifications" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-notifications" tabindex="0" data-booking-tab="notifications"><fieldset class="booking-notification-card"><legend> </legend> <p class="booking-notification-language-note"> </p> <div class="booking-notification-controls"><label class="form-check booking-fieldset-toggle"><input class="form-check-input" type="checkbox" name="notifications_enabled"/> </label> <label class="booking-recipient-field"> <input class="form-control" name="recipients" placeholder="facility@example.org, manager@example.org"/> <small> </small></label></div> <div class="booking-event-groups"><section class="booking-event-group"><h4> </h4> <div class="booking-check-list"></div></section> <section class="booking-event-group"><h4> </h4> <p> </p> <div class="booking-check-list"></div></section></div> <details class="booking-email-templates"><summary> </summary> <div class="booking-email-templates__content"><p class="booking-email-format-note"> </p> <details class="booking-email-help"><summary> </summary> <div class="booking-email-placeholders"><code></code><code></code><code></code> <code></code><code></code> <code></code><code></code><code></code> <code></code><code></code><code></code><code></code> <code></code><code></code><code></code></div></details> <details class="booking-email-layout"><summary> </summary> <p> </p> <label class="booking-email-field"><span> </span> <textarea class="form-control booking-email-html" name="template_email_layout_html" rows="10" maxlength="30000"></textarea></label></details> <h4 class="booking-email-messages-heading"> </h4> <div class="booking-email-template-grid"><section class="booking-email-template-card"><h5> </h5> <label class="booking-email-field"><span> </span><input class="form-control" name="template_verification_subject" maxlength="255"/></label> <label class="booking-email-field"><span> </span><textarea class="form-control booking-email-html" name="template_verification_body" rows="5" maxlength="30000"></textarea></label></section> <section class="booking-email-template-card"><h5> </h5> <label class="booking-email-field"><span> </span><input class="form-control" name="template_created_admin_subject" maxlength="255"/></label> <label class="booking-email-field"><span> </span><textarea class="form-control booking-email-html" name="template_created_admin_body" rows="5" maxlength="30000"></textarea></label></section> <section class="booking-email-template-card"><h5> </h5> <label class="booking-email-field"><span> </span><input class="form-control" name="template_created_requester_subject" maxlength="255"/></label> <label class="booking-email-field"><span> </span><textarea class="form-control booking-email-html" name="template_created_requester_body" rows="5" maxlength="30000"></textarea></label></section> <section class="booking-email-template-card"><h5> </h5> <label class="booking-email-field"><span> </span><input class="form-control" name="template_confirmed_subject" maxlength="255"/></label> <label class="booking-email-field"><span> </span><textarea class="form-control booking-email-html" name="template_confirmed_body_html" rows="5" maxlength="30000"></textarea></label></section> <section class="booking-email-template-card"><h5> </h5> <label class="booking-email-field"><span> </span><input class="form-control" name="template_payment_subject" maxlength="255"/></label> <label class="booking-email-field"><span> </span><textarea class="form-control booking-email-html" name="template_payment_body_html" rows="5" maxlength="30000"></textarea></label></section> <!></div></div></details></fieldset></div> <div class="booking-editor__actions"><button class="btn btn-primary" type="submit"><i class="fa fa-save" aria-hidden="true"></i> </button> <button class="btn btn-secondary" type="button"> </button></div></form>`);
  function FacilityEditor($$anchor, $$props) {
    push($$props, false);
    let facility = prop($$props, "facility", 8);
    let locale = prop($$props, "locale", 8, "en");
    let onSave = prop($$props, "onSave", 8);
    let onClose = prop($$props, "onClose", 8);
    const events = ["created", "confirmed", "rejected", "cancelled", "edited"];
    const facilityEvents = facility().notifications?.facility_events || [];
    const requesterEvents = facility().notifications?.requester_events || [];
    const emailTemplates = facility().notifications?.templates || {};
    const tabs = [
      { id: "general", label: "TAB_GENERAL" },
      { id: "booking", label: "TAB_BOOKING" },
      { id: "availability", label: "TAB_AVAILABILITY" },
      { id: "resources", label: "TAB_RESOURCES" },
      { id: "access", label: "TAB_ACCESS" },
      { id: "notifications", label: "TAB_NOTIFICATIONS" }
    ];
    let activeTab = /* @__PURE__ */ mutable_source("general");
    const bookingInterface = bookingInterfaceFor(facility().booking_interface, locale());
    let simpleSlots = /* @__PURE__ */ mutable_source(bookingInterface.resource_slots.map((slot) => ({ ...slot })));
    const groupLabel = (groups = []) => groups.join(", ");
    const tr = (key) => translate(locale(), `PLUGIN_BOOKING.ADMIN.UI.${key}`);
    const eventLabel = (event2) => tr(`EVENT_${event2.toUpperCase()}`);
    const resourceText = (resources = []) => resources.map((resource) => {
      const allowed = resource.allowed_groups || resource.access?.allowed_groups || [];
      const instant = resource.instant_approval_groups || resource.access?.instant_approval_groups || [];
      return `${resource.id} | ${resource.name} | ${resource.description || ""} | ${groupLabel(allowed)} | ${groupLabel(instant)} | ${resource.enabled === false ? "false" : "true"}`;
    }).join("\n");
    const templateValue = (key, fallback = "") => emailTemplates[key] || fallback;
    function addSimpleSlot() {
      set(simpleSlots, [
        ...get(simpleSlots),
        {
          id: `slot-${Date.now().toString(36)}-${get(simpleSlots).length + 1}`,
          label: "",
          start_time: "09:00",
          end_time: "17:00"
        }
      ]);
    }
    function removeSimpleSlot(id) {
      if (get(simpleSlots).length <= 1) return;
      set(simpleSlots, get(simpleSlots).filter((slot) => slot.id !== id));
    }
    function handleTabKeydown(event2, current) {
      const currentIndex = tabs.findIndex((tab) => tab.id === current);
      let nextIndex = currentIndex;
      if (event2.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
      else if (event2.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      else if (event2.key === "Home") nextIndex = 0;
      else if (event2.key === "End") nextIndex = tabs.length - 1;
      else return;
      event2.preventDefault();
      const nextTab = tabs[nextIndex].id;
      set(activeTab, nextTab);
      document.getElementById(`booking-facility-tab-${nextTab}`)?.focus();
    }
    async function submit(event2) {
      event2.preventDefault();
      const form = event2.currentTarget;
      if (!form.checkValidity()) {
        const invalidControl = form.querySelector(":invalid");
        const panel = invalidControl?.closest("[data-booking-tab]");
        const invalidTab = panel?.dataset.bookingTab;
        if (invalidTab) {
          set(activeTab, invalidTab);
          await tick();
        }
        invalidControl?.reportValidity();
        return;
      }
      void onSave()(new FormData(form));
    }
    init();
    var form_1 = root_6$1();
    var div = child(form_1);
    var div_1 = child(div);
    var p = child(div_1);
    var text2 = only_child(p, true);
    var h3 = sibling(p, 2);
    var text_1 = only_child(h3, true);
    var button = sibling(div_1, 2);
    var text_2 = only_child(button, true);
    var div_2 = sibling(div, 2);
    each(div_2, 5, () => tabs, (tab) => tab.id, ($$anchor2, tab) => {
      var button_1 = root$1();
      let classes;
      var text_3 = only_child(button_1, true);
      template_effect(
        ($0) => {
          set_attribute(button_1, "id", (get(tab), untrack(() => `booking-facility-tab-${get(tab).id}`)));
          classes = set_class(button_1, 1, "booking-tab", null, classes, { active: get(activeTab) === get(tab).id });
          set_attribute(button_1, "aria-selected", (get(activeTab), get(tab), untrack(() => get(activeTab) === get(tab).id)));
          set_attribute(button_1, "aria-controls", (get(tab), untrack(() => `booking-facility-panel-${get(tab).id}`)));
          set_attribute(button_1, "tabindex", (get(activeTab), get(tab), untrack(() => get(activeTab) === get(tab).id ? 0 : -1)));
          set_text(text_3, $0);
        },
        [() => (get(tab), untrack(() => tr(get(tab).label)))]
      );
      delegated("click", button_1, () => set(activeTab, get(tab).id));
      delegated("keydown", button_1, (event2) => handleTabKeydown(event2, get(tab).id));
      append($$anchor2, button_1);
    });
    var div_3 = sibling(div_2, 2);
    var div_4 = child(div_3);
    var label = child(div_4);
    var text_4 = child(label);
    var input = sibling(text_4);
    var node = sibling(input, 2);
    {
      var consequent = ($$anchor2) => {
        var small = root_1$1();
        var text_5 = only_child(small, true);
        template_effect(($0) => set_text(text_5, $0), [() => untrack(() => tr("FACILITY_ID_HELP"))]);
        append($$anchor2, small);
      };
      if_block(node, ($$render) => {
        if (deep_read_state(facility()), untrack(() => !facility().id)) $$render(consequent);
      });
    }
    var label_1 = sibling(label, 2);
    var text_6 = child(label_1);
    var input_1 = sibling(text_6);
    var label_2 = sibling(label_1, 2);
    var text_7 = child(label_2);
    var input_2 = sibling(text_7);
    var label_3 = sibling(label_2, 2);
    var text_8 = child(label_3);
    var input_3 = sibling(text_8);
    var label_4 = sibling(label_3, 2);
    var text_9 = child(label_4);
    var select = sibling(text_9);
    var option = child(select);
    var text_10 = only_child(option, true);
    option.value = option.__value = "facility";
    var option_1 = sibling(option);
    var text_11 = only_child(option_1, true);
    option_1.value = option_1.__value = "resources";
    var option_2 = sibling(option_1);
    var text_12 = only_child(option_2, true);
    option_2.value = option_2.__value = "both";
    var select_value;
    init_select(select);
    var label_5 = sibling(label_4, 2);
    var text_13 = child(label_5);
    var select_1 = sibling(text_13);
    var option_3 = child(select_1);
    var text_14 = only_child(option_3, true);
    option_3.value = option_3.__value = "manual";
    var option_4 = sibling(option_3);
    var text_15 = only_child(option_4, true);
    option_4.value = option_4.__value = "automatic";
    var select_1_value;
    init_select(select_1);
    var label_6 = sibling(label_5, 2);
    var input_4 = child(label_6);
    var text_16 = sibling(input_4, 1, true);
    var div_5 = sibling(div_3, 2);
    var fieldset = child(div_5);
    var legend = child(fieldset);
    var text_17 = only_child(legend, true);
    var div_6 = sibling(legend, 2);
    var label_7 = child(div_6);
    var text_18 = child(label_7);
    var select_2 = sibling(text_18);
    var option_5 = child(select_2);
    var text_19 = only_child(option_5, true);
    option_5.value = option_5.__value = "simple";
    var option_6 = sibling(option_5);
    var text_20 = only_child(option_6, true);
    option_6.value = option_6.__value = "custom";
    var select_2_value;
    init_select(select_2);
    var small_1 = sibling(select_2, 2);
    var text_21 = only_child(small_1, true);
    var label_8 = sibling(label_7, 2);
    var text_22 = child(label_8);
    var input_5 = sibling(text_22);
    var label_9 = sibling(label_8, 2);
    var text_23 = child(label_9);
    var input_6 = sibling(text_23);
    var small_2 = sibling(input_6, 2);
    var text_24 = only_child(small_2, true);
    var div_7 = sibling(div_6, 2);
    var div_8 = child(div_7);
    var div_9 = child(div_8);
    var strong = child(div_9);
    var text_25 = only_child(strong, true);
    var small_3 = sibling(strong);
    var text_26 = only_child(small_3, true);
    var button_2 = sibling(div_9, 2);
    var text_27 = sibling(child(button_2));
    var node_1 = sibling(div_8, 2);
    each(node_1, 1, () => get(simpleSlots), (slot) => slot.id, ($$anchor2, slot, $$index_1) => {
      var div_10 = root_2$1();
      var input_7 = child(div_10);
      var label_10 = sibling(input_7, 2);
      var text_28 = child(label_10);
      var input_8 = sibling(text_28);
      var label_11 = sibling(label_10, 2);
      var text_29 = child(label_11);
      var input_9 = sibling(text_29);
      var label_12 = sibling(label_11, 2);
      var text_30 = child(label_12);
      var input_10 = sibling(text_30);
      var button_3 = sibling(label_12, 2);
      var text_31 = only_child(button_3, true);
      template_effect(
        ($0, $1, $2, $3) => {
          set_value(input_7, (get(slot), untrack(() => get(slot).id)));
          set_text(text_28, $0);
          set_text(text_29, $1);
          set_text(text_30, $2);
          button_3.disabled = (get(simpleSlots), untrack(() => get(simpleSlots).length <= 1));
          set_text(text_31, $3);
        },
        [
          () => untrack(() => tr("PERIOD_NAME")),
          () => untrack(() => tr("START")),
          () => untrack(() => tr("END")),
          () => untrack(() => tr("REMOVE_PERIOD"))
        ]
      );
      bind_value(input_8, () => get(slot).label, ($$value) => (get(slot).label = $$value, invalidate_inner_signals(() => get(simpleSlots))));
      bind_value(input_9, () => get(slot).start_time, ($$value) => (get(slot).start_time = $$value, invalidate_inner_signals(() => get(simpleSlots))));
      bind_value(input_10, () => get(slot).end_time, ($$value) => (get(slot).end_time = $$value, invalidate_inner_signals(() => get(simpleSlots))));
      delegated("click", button_3, () => removeSimpleSlot(get(slot).id));
      append($$anchor2, div_10);
    });
    var fieldset_1 = sibling(fieldset, 2);
    var legend_1 = child(fieldset_1);
    var text_32 = only_child(legend_1, true);
    var div_11 = sibling(legend_1, 2);
    var label_13 = child(div_11);
    var text_33 = child(label_13);
    var input_11 = sibling(text_33);
    var label_14 = sibling(label_13, 2);
    var text_34 = child(label_14);
    var input_12 = sibling(text_34);
    var label_15 = sibling(label_14, 2);
    var text_35 = child(label_15);
    var input_13 = sibling(text_35);
    var label_16 = sibling(label_15, 2);
    var text_36 = child(label_16);
    var input_14 = sibling(text_36);
    var label_17 = sibling(label_16, 2);
    var text_37 = child(label_17);
    var input_15 = sibling(text_37);
    var p_1 = sibling(div_11, 2);
    var text_38 = only_child(p_1, true);
    var div_12 = sibling(div_5, 2);
    var fieldset_2 = child(div_12);
    var legend_2 = child(fieldset_2);
    var text_39 = only_child(legend_2, true);
    var label_18 = sibling(legend_2, 2);
    var text_40 = child(label_18);
    var textarea = sibling(text_40);
    var small_4 = sibling(label_18, 2);
    var text_41 = child(small_4);
    var div_13 = sibling(div_12, 2);
    var fieldset_3 = child(div_13);
    var legend_3 = child(fieldset_3);
    var text_42 = only_child(legend_3, true);
    var label_19 = sibling(legend_3, 2);
    var text_43 = child(label_19);
    var textarea_1 = sibling(text_43);
    var small_5 = sibling(label_19, 2);
    var text_44 = sibling(child(small_5), 2);
    var text_45 = sibling(text_44, 2);
    var div_14 = sibling(div_13, 2);
    var fieldset_4 = child(div_14);
    var legend_4 = child(fieldset_4);
    var text_46 = only_child(legend_4, true);
    var label_20 = sibling(legend_4, 2);
    var input_16 = child(label_20);
    var text_47 = sibling(input_16, 1, true);
    var div_15 = sibling(label_20, 2);
    var label_21 = child(div_15);
    var text_48 = child(label_21);
    var input_17 = sibling(text_48);
    var small_6 = sibling(input_17, 2);
    var text_49 = only_child(small_6, true);
    var label_22 = sibling(label_21, 2);
    var text_50 = child(label_22);
    var input_18 = sibling(text_50);
    var small_7 = sibling(input_18, 2);
    var text_51 = only_child(small_7, true);
    var div_16 = sibling(div_14, 2);
    var fieldset_5 = child(div_16);
    var legend_5 = child(fieldset_5);
    var text_52 = only_child(legend_5, true);
    var p_2 = sibling(legend_5, 2);
    var text_53 = only_child(p_2, true);
    var div_17 = sibling(p_2, 2);
    var label_23 = child(div_17);
    var input_19 = child(label_23);
    var text_54 = sibling(input_19, 1, true);
    var label_24 = sibling(label_23, 2);
    var text_55 = child(label_24);
    var input_20 = sibling(text_55);
    var small_8 = sibling(input_20, 2);
    var text_56 = only_child(small_8, true);
    var div_18 = sibling(div_17, 2);
    var section = child(div_18);
    var h4 = child(section);
    var text_57 = only_child(h4, true);
    var div_19 = sibling(h4, 2);
    each(div_19, 5, () => events, index, ($$anchor2, event2) => {
      var label_25 = root_3$1();
      var input_21 = child(label_25);
      var text_58 = sibling(input_21, 1, true);
      template_effect(
        ($0, $1) => {
          set_value(input_21, get(event2));
          set_checked(input_21, $0);
          set_text(text_58, $1);
        },
        [
          () => (get(event2), untrack(() => facilityEvents.includes(get(event2)))),
          () => (get(event2), untrack(() => eventLabel(get(event2))))
        ]
      );
      append($$anchor2, label_25);
    });
    var section_1 = sibling(section, 2);
    var h4_1 = child(section_1);
    var text_59 = only_child(h4_1, true);
    var p_3 = sibling(h4_1, 2);
    var text_60 = only_child(p_3, true);
    var div_20 = sibling(p_3, 2);
    each(div_20, 5, () => events, index, ($$anchor2, event2) => {
      var label_26 = root_4$1();
      var input_22 = child(label_26);
      var text_61 = sibling(input_22, 1, true);
      template_effect(
        ($0, $1, $2) => {
          set_value(input_22, get(event2));
          set_checked(input_22, $0);
          input_22.disabled = $1;
          set_text(text_61, $2);
        },
        [
          () => (get(event2), untrack(() => ["created", "confirmed"].includes(get(event2)) || requesterEvents.includes(get(event2)))),
          () => (get(event2), untrack(() => ["created", "confirmed"].includes(get(event2)))),
          () => (get(event2), untrack(() => eventLabel(get(event2))))
        ]
      );
      append($$anchor2, label_26);
    });
    var details = sibling(div_18, 2);
    var summary = child(details);
    var text_62 = only_child(summary, true);
    var div_21 = sibling(summary, 2);
    var p_4 = child(div_21);
    var text_63 = only_child(p_4, true);
    var details_1 = sibling(p_4, 2);
    var summary_1 = child(details_1);
    var text_64 = only_child(summary_1, true);
    var div_22 = sibling(summary_1, 2);
    var code = child(div_22);
    code.textContent = "{{ customer.name }}";
    var code_1 = sibling(code);
    code_1.textContent = "{{ customer.email }}";
    var code_2 = sibling(code_1);
    code_2.textContent = "{{ customer.phone }}";
    var code_3 = sibling(code_2, 2);
    code_3.textContent = "{{ facility.name }}";
    var code_4 = sibling(code_3);
    code_4.textContent = "{{ facility.description }}";
    var code_5 = sibling(code_4, 2);
    code_5.textContent = "{{ booking.id }}";
    var code_6 = sibling(code_5);
    code_6.textContent = "{{ booking.status }}";
    var code_7 = sibling(code_6);
    code_7.textContent = "{{ booking.resource }}";
    var code_8 = sibling(code_7, 2);
    code_8.textContent = "{{ booking.start }}";
    var code_9 = sibling(code_8);
    code_9.textContent = "{{ booking.end }}";
    var code_10 = sibling(code_9);
    code_10.textContent = "{{ booking.timezone }}";
    var code_11 = sibling(code_10);
    code_11.textContent = "{{ booking.note }}";
    var code_12 = sibling(code_11, 2);
    code_12.textContent = "{{ verification.code }}";
    var code_13 = sibling(code_12);
    code_13.textContent = "{{ verification.expires_in_hours }}";
    var code_14 = sibling(code_13);
    code_14.textContent = "{{ email.body }}";
    var details_2 = sibling(details_1, 2);
    var summary_2 = child(details_2);
    var text_65 = only_child(summary_2, true);
    var p_5 = sibling(summary_2, 2);
    var text_66 = only_child(p_5, true);
    var label_27 = sibling(p_5, 2);
    var span = child(label_27);
    var text_67 = only_child(span, true);
    var textarea_2 = sibling(span, 2);
    var h4_2 = sibling(details_2, 2);
    var text_68 = only_child(h4_2, true);
    var div_23 = sibling(h4_2, 2);
    var section_2 = child(div_23);
    var h5 = child(section_2);
    var text_69 = only_child(h5, true);
    var label_28 = sibling(h5, 2);
    var span_1 = child(label_28);
    var text_70 = only_child(span_1, true);
    var input_23 = sibling(span_1);
    var label_29 = sibling(label_28, 2);
    var span_2 = child(label_29);
    var text_71 = only_child(span_2, true);
    var textarea_3 = sibling(span_2);
    var section_3 = sibling(section_2, 2);
    var h5_1 = child(section_3);
    var text_72 = only_child(h5_1, true);
    var label_30 = sibling(h5_1, 2);
    var span_3 = child(label_30);
    var text_73 = only_child(span_3, true);
    var input_24 = sibling(span_3);
    var label_31 = sibling(label_30, 2);
    var span_4 = child(label_31);
    var text_74 = only_child(span_4, true);
    var textarea_4 = sibling(span_4);
    var section_4 = sibling(section_3, 2);
    var h5_2 = child(section_4);
    var text_75 = only_child(h5_2, true);
    var label_32 = sibling(h5_2, 2);
    var span_5 = child(label_32);
    var text_76 = only_child(span_5, true);
    var input_25 = sibling(span_5);
    var label_33 = sibling(label_32, 2);
    var span_6 = child(label_33);
    var text_77 = only_child(span_6, true);
    var textarea_5 = sibling(span_6);
    var section_5 = sibling(section_4, 2);
    var h5_3 = child(section_5);
    var text_78 = only_child(h5_3, true);
    var label_34 = sibling(h5_3, 2);
    var span_7 = child(label_34);
    var text_79 = only_child(span_7, true);
    var input_26 = sibling(span_7);
    var label_35 = sibling(label_34, 2);
    var span_8 = child(label_35);
    var text_80 = only_child(span_8, true);
    var textarea_6 = sibling(span_8);
    var section_6 = sibling(section_5, 2);
    var h5_4 = child(section_6);
    var text_81 = only_child(h5_4, true);
    var label_36 = sibling(h5_4, 2);
    var span_9 = child(label_36);
    var text_82 = only_child(span_9, true);
    var input_27 = sibling(span_9);
    var label_37 = sibling(label_36, 2);
    var span_10 = child(label_37);
    var text_83 = only_child(span_10, true);
    var textarea_7 = sibling(span_10);
    var node_2 = sibling(section_6, 2);
    each(node_2, 0, () => ["rejected", "cancelled", "edited"], index, ($$anchor2, event2) => {
      var section_7 = root_5$1();
      var h5_5 = child(section_7);
      var text_84 = only_child(h5_5, true);
      var label_38 = sibling(h5_5, 2);
      var span_11 = child(label_38);
      var text_85 = only_child(span_11, true);
      var input_28 = sibling(span_11);
      var label_39 = sibling(label_38, 2);
      var span_12 = child(label_39);
      var text_86 = only_child(span_12, true);
      var textarea_8 = sibling(span_12);
      template_effect(
        ($0, $1, $2, $3, $4) => {
          set_text(text_84, $0);
          set_text(text_85, $1);
          set_attribute(input_28, "name", `template_${event2}_subject`);
          set_value(input_28, $2);
          set_text(text_86, $3);
          set_attribute(textarea_8, "name", `template_${event2}_body`);
          set_value(textarea_8, $4);
        },
        [
          () => untrack(() => tr(`EMAIL_EVENT_${event2.toUpperCase()}`)),
          () => untrack(() => tr(`${event2.toUpperCase()}_EMAIL_SUBJECT`)),
          () => untrack(() => templateValue(`${event2}_subject`)),
          () => untrack(() => tr(`${event2.toUpperCase()}_EMAIL_BODY`)),
          () => untrack(() => templateValue(`${event2}_body`))
        ]
      );
      append($$anchor2, section_7);
    });
    var div_24 = sibling(div_16, 2);
    var button_4 = child(div_24);
    var text_87 = sibling(child(button_4));
    var button_5 = sibling(button_4, 2);
    var text_88 = only_child(button_5, true);
    template_effect(
      ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, $83, $84, $85, $86, $87, $88, $89, $90, $91, $92, $93, $94, $95, $96, $97, $98, $99, $100, $101, $102) => {
        set_text(text2, $0);
        set_text(text_1, $1);
        set_text(text_2, $2);
        set_attribute(div_2, "aria-label", $3);
        set_attribute(div_3, "hidden", get(activeTab) !== "general");
        set_text(text_4, `${$4 ?? ""} `);
        set_value(input, (deep_read_state(facility()), untrack(() => facility().id)));
        input.readOnly = $5;
        input.required = (deep_read_state(facility()), untrack(() => !facility().id));
        set_text(text_6, $6);
        set_value(input_1, (deep_read_state(facility()), untrack(() => facility().name)));
        set_text(text_7, $7);
        set_value(input_2, (deep_read_state(facility()), untrack(() => facility().description || "")));
        set_text(text_8, $8);
        set_value(input_3, (deep_read_state(facility()), untrack(() => facility().timezone)));
        set_text(text_9, `${$9 ?? ""} `);
        set_text(text_10, $10);
        set_text(text_11, $11);
        set_text(text_12, $12);
        if (select_value !== (select_value = (deep_read_state(facility()), untrack(() => facility().booking_mode)))) {
          select.value = (select.__value = select_value) ?? "", select_option(select, select_value);
        }
        set_text(text_13, `${$13 ?? ""} `);
        set_text(text_14, $14);
        set_text(text_15, $15);
        if (select_1_value !== (select_1_value = (deep_read_state(facility()), untrack(() => facility().approval_mode)))) {
          select_1.value = (select_1.__value = select_1_value) ?? "", select_option(select_1, select_1_value);
        }
        set_checked(input_4, (deep_read_state(facility()), untrack(() => facility().enabled)));
        set_text(text_16, $16);
        set_attribute(div_5, "hidden", get(activeTab) !== "booking");
        set_text(text_17, $17);
        set_text(text_18, `${$18 ?? ""} `);
        set_text(text_19, $19);
        set_text(text_20, $20);
        if (select_2_value !== (select_2_value = untrack(() => bookingInterface.default_mode))) {
          select_2.value = (select_2.__value = select_2_value) ?? "", select_option(select_2, select_2_value);
        }
        set_text(text_21, $21);
        set_text(text_22, `${$22 ?? ""} `);
        set_value(input_5, untrack(() => bookingInterface.whole_day_start_time));
        set_text(text_23, `${$23 ?? ""} `);
        set_value(input_6, untrack(() => bookingInterface.whole_day_end_time));
        set_text(text_24, $24);
        set_text(text_25, $25);
        set_text(text_26, $26);
        set_text(text_27, ` ${$27 ?? ""}`);
        set_text(text_32, $28);
        set_text(text_33, $29);
        set_value(input_11, $30);
        set_text(text_34, $31);
        set_value(input_12, $32);
        set_text(text_35, $33);
        set_value(input_13, $34);
        set_text(text_36, $35);
        set_value(input_14, $36);
        set_text(text_37, $37);
        set_value(input_15, $38);
        set_text(text_38, $39);
        set_attribute(div_12, "hidden", get(activeTab) !== "availability");
        set_text(text_39, $40);
        set_text(text_40, `${$41 ?? ""} `);
        set_value(textarea, $42);
        set_text(text_41, `${$43 ?? ""} `);
        set_attribute(div_13, "hidden", get(activeTab) !== "resources");
        set_text(text_42, $44);
        set_text(text_43, `${$45 ?? ""} `);
        set_value(textarea_1, $46);
        set_text(text_44, `${$47 ?? ""} `);
        set_text(text_45, ` ${$48 ?? ""}`);
        set_attribute(div_14, "hidden", get(activeTab) !== "access");
        set_text(text_46, $49);
        set_checked(input_16, (deep_read_state(facility()), untrack(() => facility().access?.guest_requests !== false)));
        set_text(text_47, $50);
        set_text(text_48, `${$51 ?? ""} `);
        set_value(input_17, $52);
        set_attribute(input_17, "placeholder", $53);
        set_text(text_49, $54);
        set_text(text_50, `${$55 ?? ""} `);
        set_value(input_18, $56);
        set_attribute(input_18, "placeholder", $57);
        set_text(text_51, $58);
        set_attribute(div_16, "hidden", get(activeTab) !== "notifications");
        set_text(text_52, $59);
        set_text(text_53, $60);
        set_checked(input_19, (deep_read_state(facility()), untrack(() => facility().notifications?.enabled || false)));
        set_text(text_54, $61);
        set_text(text_55, `${$62 ?? ""} `);
        set_value(input_20, $63);
        set_text(text_56, $64);
        set_text(text_57, $65);
        set_text(text_59, $66);
        set_text(text_60, $67);
        set_text(text_62, $68);
        set_text(text_63, $69);
        set_text(text_64, $70);
        set_text(text_65, $71);
        set_text(text_66, $72);
        set_text(text_67, $73);
        set_value(textarea_2, $74);
        set_text(text_68, $75);
        set_text(text_69, $76);
        set_text(text_70, $77);
        set_value(input_23, $78);
        set_text(text_71, $79);
        set_value(textarea_3, $80);
        set_text(text_72, $81);
        set_text(text_73, $82);
        set_value(input_24, $83);
        set_text(text_74, $84);
        set_value(textarea_4, $85);
        set_text(text_75, $86);
        set_text(text_76, $87);
        set_value(input_25, $88);
        set_text(text_77, $89);
        set_value(textarea_5, $90);
        set_text(text_78, $91);
        set_text(text_79, $92);
        set_value(input_26, $93);
        set_text(text_80, $94);
        set_value(textarea_6, $95);
        set_text(text_81, $96);
        set_text(text_82, $97);
        set_value(input_27, $98);
        set_text(text_83, $99);
        set_value(textarea_7, $100);
        set_text(text_87, ` ${$101 ?? ""}`);
        set_text(text_88, $102);
      },
      [
        () => untrack(() => tr("FACILITY_SETTINGS")),
        () => (deep_read_state(facility()), untrack(() => facility().id ? tr("EDIT_FACILITY") : tr("NEW_FACILITY"))),
        () => untrack(() => tr("CLOSE")),
        () => untrack(() => tr("FACILITY_SETTINGS_TABS")),
        () => untrack(() => tr("FACILITY_ID")),
        () => (deep_read_state(facility()), untrack(() => Boolean(facility().id))),
        () => untrack(() => tr("NAME")),
        () => untrack(() => tr("DESCRIPTION")),
        () => untrack(() => tr("TIMEZONE")),
        () => untrack(() => tr("BOOKING_MODE")),
        () => untrack(() => tr("MODE_FACILITY")),
        () => untrack(() => tr("MODE_RESOURCES")),
        () => untrack(() => tr("MODE_BOTH")),
        () => untrack(() => tr("DEFAULT_APPROVAL")),
        () => untrack(() => tr("APPROVAL_MANUAL")),
        () => untrack(() => tr("APPROVAL_AUTOMATIC")),
        () => untrack(() => tr("ENABLED_FOR_BOOKING")),
        () => untrack(() => tr("SIMPLE_BOOKING_OPTIONS")),
        () => untrack(() => tr("DEFAULT_BOOKING_ENTRY")),
        () => untrack(() => tr("SIMPLE_MODE")),
        () => untrack(() => tr("CUSTOM_MODE")),
        () => untrack(() => tr("DEFAULT_BOOKING_ENTRY_HELP")),
        () => untrack(() => tr("WHOLE_DAY_CHECK_IN")),
        () => untrack(() => tr("WHOLE_DAY_CHECK_OUT")),
        () => untrack(() => tr("WHOLE_DAY_TIME_HELP")),
        () => untrack(() => tr("ROOM_BOOKING_PERIODS")),
        () => untrack(() => tr("ROOM_BOOKING_PERIODS_HELP")),
        () => untrack(() => tr("ADD_PERIOD")),
        () => untrack(() => tr("BOOKING_RULES")),
        () => untrack(() => tr("MINIMUM_DURATION")),
        () => (deep_read_state(facility()), untrack(() => Math.max(1, Math.round((facility().booking_rules?.minimum_duration_seconds || 3600) / 60)))),
        () => untrack(() => tr("MAXIMUM_DURATION")),
        () => (deep_read_state(facility()), untrack(() => Math.max(1, Math.round((facility().booking_rules?.maximum_duration_seconds || 259200) / 60)))),
        () => untrack(() => tr("BOOKING_INTERVAL")),
        () => (deep_read_state(facility()), untrack(() => Math.max(1, Math.round((facility().booking_rules?.booking_interval_seconds || 1800) / 60)))),
        () => untrack(() => tr("MINIMUM_NOTICE")),
        () => (deep_read_state(facility()), untrack(() => Math.round((facility().booking_rules?.minimum_advance_notice_seconds || 0) / 3600))),
        () => untrack(() => tr("BOOKING_HORIZON")),
        () => (deep_read_state(facility()), untrack(() => Math.max(1, Math.round((facility().booking_rules?.maximum_horizon_seconds || 7776e3) / 86400)))),
        () => untrack(() => tr("PENDING_BLOCKS")),
        () => untrack(() => tr("AVAILABILITY_HOURS")),
        () => untrack(() => tr("ONE_RANGE_PER_LINE")),
        () => (deep_read_state(facility()), untrack(() => facility().availability_windows.map((item) => `${item.start} - ${item.end}`).join("\n"))),
        () => untrack(() => tr("AVAILABILITY_HELP")),
        () => untrack(() => tr("ROOMS_AND_RESOURCES")),
        () => untrack(() => tr("ONE_ROOM_PER_LINE")),
        () => (deep_read_state(facility()), untrack(() => resourceText(facility().resources))),
        () => untrack(() => tr("ROOMS_HELP_PREFIX")),
        () => untrack(() => tr("ROOMS_HELP_SUFFIX")),
        () => untrack(() => tr("MEMBER_ACCESS")),
        () => untrack(() => tr("ALLOW_GUEST_REQUESTS")),
        () => untrack(() => tr("ALLOWED_GROUPS")),
        () => (deep_read_state(facility()), untrack(() => groupLabel(facility().access?.allowed_groups))),
        () => untrack(() => tr("ANY_MEMBER_IF_EMPTY")),
        () => untrack(() => tr("COMMA_SEPARATED_GROUPS")),
        () => untrack(() => tr("INSTANT_APPROVAL_GROUPS")),
        () => (deep_read_state(facility()), untrack(() => groupLabel(facility().access?.instant_approval_groups))),
        () => untrack(() => tr("GROUPS_EXAMPLE")),
        () => untrack(() => tr("INSTANT_APPROVAL_HELP")),
        () => untrack(() => tr("EMAIL_NOTIFICATIONS")),
        () => untrack(() => tr("EMAIL_SINGLE_LANGUAGE_NOTE")),
        () => untrack(() => tr("SEND_EMAIL_NOTIFICATIONS")),
        () => untrack(() => tr("FACILITY_ADMIN_EMAILS")),
        () => (deep_read_state(facility()), untrack(() => groupLabel(facility().notifications?.admin_recipients))),
        () => untrack(() => tr("ADMIN_EMAILS_HELP")),
        () => untrack(() => tr("NOTIFY_FACILITY_CONTACTS")),
        () => untrack(() => tr("NOTIFY_REQUESTER")),
        () => untrack(() => tr("REQUESTER_REQUIRED_EMAILS_HELP")),
        () => untrack(() => tr("CUSTOMIZE_EMAIL_TEMPLATES")),
        () => untrack(() => tr("EMAIL_TEMPLATE_HELP")),
        () => untrack(() => tr("EMAIL_PLACEHOLDERS")),
        () => untrack(() => tr("EMAIL_LAYOUT_OVERRIDE")),
        () => untrack(() => tr("EMAIL_LAYOUT_HELP")),
        () => untrack(() => tr("EMAIL_LAYOUT_HTML")),
        () => untrack(() => templateValue("email_layout_html")),
        () => untrack(() => tr("EMAIL_MESSAGES")),
        () => untrack(() => tr("EMAIL_EVENT_VERIFICATION")),
        () => untrack(() => tr("VERIFICATION_EMAIL_SUBJECT")),
        () => untrack(() => templateValue("verification_subject", "Verify your booking request")),
        () => untrack(() => tr("VERIFICATION_EMAIL_BODY")),
        () => untrack(() => templateValue("verification_body", "<p>Hello {{ customer.name }},</p><p>Enter this code within 24 hours:</p><p><strong>{{ verification.code }}</strong></p><p>Booking reference: {{ booking.id }}</p>")),
        () => untrack(() => tr("EMAIL_EVENT_NEW_REQUEST_ADMIN")),
        () => untrack(() => tr("PENDING_ADMIN_EMAIL_SUBJECT")),
        () => untrack(() => templateValue("created_admin_subject", "Booking request received")),
        () => untrack(() => tr("PENDING_ADMIN_EMAIL_BODY")),
        () => untrack(() => templateValue("created_admin_body", "<p>A new verified booking request is waiting for approval.</p><ul><li>{{ facility.name }}</li><li>{{ booking.start }} – {{ booking.end }}</li><li>{{ customer.name }} · {{ customer.email }}</li><li>Booking reference: {{ booking.id }}</li></ul>")),
        () => untrack(() => tr("EMAIL_EVENT_NEW_REQUEST_REQUESTER")),
        () => untrack(() => tr("PENDING_REQUESTER_EMAIL_SUBJECT")),
        () => untrack(() => templateValue("created_requester_subject", "Booking request received")),
        () => untrack(() => tr("PENDING_REQUESTER_EMAIL_BODY")),
        () => untrack(() => templateValue("created_requester_body", "<p>Hello {{ customer.name }},</p><p>Your email has been verified and your booking request is waiting for approval.</p><ul><li>{{ facility.name }}</li><li>{{ booking.start }} – {{ booking.end }}</li><li>Booking reference: {{ booking.id }}</li></ul>")),
        () => untrack(() => tr("EMAIL_EVENT_APPROVAL")),
        () => untrack(() => tr("APPROVAL_EMAIL_SUBJECT")),
        () => untrack(() => templateValue("confirmed_subject")),
        () => untrack(() => tr("APPROVAL_EMAIL_BODY_HTML")),
        () => untrack(() => templateValue("confirmed_body_html")),
        () => untrack(() => tr("EMAIL_EVENT_PAYMENT")),
        () => untrack(() => tr("PAYMENT_EMAIL_SUBJECT")),
        () => untrack(() => templateValue("payment_subject", "Payment information")),
        () => untrack(() => tr("PAYMENT_EMAIL_BODY_HTML")),
        () => untrack(() => templateValue("payment_body_html")),
        () => untrack(() => tr("SAVE_FACILITY")),
        () => untrack(() => tr("CANCEL"))
      ]
    );
    event("submit", form_1, submit);
    delegated("click", button, function(...$$args) {
      onClose()?.apply(this, $$args);
    });
    delegated("click", button_2, addSimpleSlot);
    delegated("click", button_5, function(...$$args) {
      onClose()?.apply(this, $$args);
    });
    append($$anchor, form_1);
    pop();
  }
  delegate(["click", "keydown"]);
  async function api(path, options = {}) {
    const server = String(window.__GRAV_API_SERVER_URL || "").replace(/\/$/, "");
    const prefix = String(window.__GRAV_API_PREFIX || "/api/v1").replace(/\/$/, "");
    const headers = new Headers(options.headers);
    if (window.__GRAV_API_TOKEN) headers.set("X-API-Token", window.__GRAV_API_TOKEN);
    let body;
    if (options.body instanceof FormData || options.body instanceof Blob || typeof options.body === "string") {
      body = options.body;
    } else if (options.body !== void 0) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }
    const response = await fetch(`${server}${prefix}/booking${path}`, {
      credentials: "same-origin",
      ...options,
      headers,
      body
    });
    let payload = {};
    try {
      const parsed = await response.json();
      if (parsed && typeof parsed === "object") payload = parsed;
    } catch {
    }
    const data = payload.data ?? payload;
    if (!response.ok) {
      const message = data.message || data.error?.message || payload.message || `Request failed (${response.status}).`;
      throw new Error(message);
    }
    return data;
  }
  async function confirmAction(options) {
    if (window.__GRAV_DIALOGS?.confirm) return window.__GRAV_DIALOGS.confirm(options);
    return window.confirm(`${options.title}

${options.message}`);
  }
  var root = /* @__PURE__ */ from_html(`<p> </p>`);
  var root_1 = /* @__PURE__ */ from_html(`<p class="booking-alert__note"> </p>`);
  var root_2 = /* @__PURE__ */ from_html(`<button type="button" class="btn btn-secondary"><i class="fa fa-download" aria-hidden="true"></i> </button>`);
  var root_3 = /* @__PURE__ */ from_html(`<section aria-live="polite"><div class="booking-alert__content"><strong> </strong><p> </p> <!> <!> <!></div> <!></section>`);
  var root_4 = /* @__PURE__ */ from_html(`<div role="status"> <button class="booking-alert__close" type="button">&times;</button></div>`);
  var root_5 = /* @__PURE__ */ from_html(`<option> </option>`);
  var root_6 = /* @__PURE__ */ from_html(`<tr><td colspan="7" class="table-message"> </td></tr>`);
  var root_7 = /* @__PURE__ */ from_html(`<button type="button" class="btn btn-primary"><i class="fa fa-plus" aria-hidden="true"></i> </button>`);
  var root_8 = /* @__PURE__ */ from_html(`<tr><td colspan="7" class="table-message"><strong> </strong> <p> </p> <!></td></tr>`);
  var root_9 = /* @__PURE__ */ from_html(`<button class="btn btn-sm btn-success" type="button"> </button> <button class="btn btn-sm btn-warning" type="button"> </button>`, 1);
  var root_10 = /* @__PURE__ */ from_html(`<button class="btn btn-sm btn-warning" type="button"> </button>`);
  var root_11 = /* @__PURE__ */ from_html(`<tr><td> </td><td> </td><td><strong> </strong><br/><a> </a></td><td> </td><td> </td><td><span> </span></td><td><div class="booking-row-actions"><button class="btn btn-sm btn-secondary" type="button"> </button> <button class="btn btn-sm btn-secondary" type="button"> </button> <!> <!> <button class="btn btn-sm btn-danger" type="button"> </button></div></td></tr>`);
  var root_12 = /* @__PURE__ */ from_html(`<button class="btn btn-sm btn-secondary" type="button"><i class="fa fa-arrow-left" aria-hidden="true"></i> </button>`);
  var root_13 = /* @__PURE__ */ from_html(`<button class="btn btn-sm btn-secondary" type="button"> <i class="fa fa-arrow-right" aria-hidden="true"></i></button>`);
  var root_14 = /* @__PURE__ */ from_html(`<div class="booking-table-wrap"><div class="booking-table-scroll"><table class="booking-table"><thead><tr><th> </th><th> </th><th> </th><th> </th><th> </th><th> </th><th> </th></tr></thead><tbody><!></tbody></table></div></div> <footer class="booking-table-footer"><p> </p> <div class="booking-pagination"><!> <!></div></footer>`, 1);
  var root_15 = /* @__PURE__ */ from_html(`<tr><td colspan="5" class="table-message"> </td></tr>`);
  var root_16 = /* @__PURE__ */ from_html(`<tr><td colspan="5" class="table-message"><strong> </strong> <p> </p> <button type="button" class="btn btn-primary"><i class="fa fa-plus" aria-hidden="true"></i> </button></td></tr>`);
  var root_17 = /* @__PURE__ */ from_html(`<span class="status-badge status-badge--disabled"> </span>`);
  var root_18 = /* @__PURE__ */ from_html(`<span class="availability-window"> </span>`);
  var root_19 = /* @__PURE__ */ from_html(`<tr><td><strong> </strong><br/><code> </code><!></td><td> </td><td><span> </span></td><td></td><td><div class="booking-row-actions"><button type="button" class="btn btn-sm btn-secondary"> </button> <button type="button" class="btn btn-sm btn-danger"> </button></div></td></tr>`);
  var root_20 = /* @__PURE__ */ from_html(`<div class="booking-editor"><!></div>`);
  var root_21 = /* @__PURE__ */ from_html(`<tr><td colspan="6" class="table-message"> </td></tr>`);
  var root_22 = /* @__PURE__ */ from_html(`<tr><td><span class="status-badge status-badge--disabled"> </span></td><td> </td><td> </td><td> </td><td> </td><td><button class="btn btn-sm btn-danger" type="button"> </button></td></tr>`);
  var root_23 = /* @__PURE__ */ from_html(`<!> <!>`, 1);
  var root_24 = /* @__PURE__ */ from_html(`<li><time> </time> </li>`);
  var root_25 = /* @__PURE__ */ from_html(`<ul class="booking-detail-list"></ul>`);
  var root_26 = /* @__PURE__ */ from_html(`<p class="booking-detail-empty"> </p>`);
  var root_27 = /* @__PURE__ */ from_html(`<li><strong> </strong> <!></li>`);
  var root_28 = /* @__PURE__ */ from_html(`<button type="button" class="btn btn-secondary"> </button>`);
  var root_29 = /* @__PURE__ */ from_html(`<div class="booking-dialog__heading"><div><p class="booking-eyebrow"> </p><h2> </h2></div> <button type="button" class="btn btn-icon btn-secondary">&times;</button></div> <dl class="booking-detail-grid"><dt> </dt><dd> </dd> <dt> </dt><dd> </dd> <dt> </dt><dd> </dd> <dt> </dt><dd><span> </span></dd> <dt> </dt><dd> </dd> <dt> </dt><dd> </dd></dl> <h3 class="booking-detail-subheading"> </h3> <!> <h3 class="booking-detail-subheading"> </h3> <!> <div class="booking-dialog__actions"><!> <button type="button" class="btn btn-secondary"> </button></div>`, 1);
  var root_30 = /* @__PURE__ */ from_html(`<main class="booking-admin"><p class="booking-page-description"> </p> <!> <!> <div class="booking-tabs" role="tablist"><button id="booking-tab-bookings" role="tab" aria-controls="booking-panel-bookings" data-tab="bookings"><i class="fa fa-list" aria-hidden="true"></i><span> </span><span class="booking-tab__count"> </span></button> <button id="booking-tab-facilities" role="tab" aria-controls="booking-panel-facilities" data-tab="facilities"><i class="fa fa-building" aria-hidden="true"></i><span> </span><span class="booking-tab__count"> </span></button> <button id="booking-tab-blocks" role="tab" aria-controls="booking-panel-blocks" data-tab="blocks"><i class="fa fa-ban" aria-hidden="true"></i><span> </span></button></div> <div id="booking-panel-bookings" class="booking-panel" role="tabpanel" aria-labelledby="booking-tab-bookings" tabindex="0"><div class="booking-section-heading"><div><h2> </h2><p> </p></div> <div class="booking-actions"><div class="booking-view-switch" role="group"><button type="button"><i class="fa fa-list" aria-hidden="true"></i> </button> <button type="button"><i class="fa fa-calendar" aria-hidden="true"></i> </button></div> <button class="btn btn-secondary" type="button"><i class="fa fa-refresh" aria-hidden="true"></i> </button> <button class="btn btn-primary" type="button"><i class="fa fa-plus" aria-hidden="true"></i> </button></div></div> <div class="booking-toolbar"><label class="booking-field"> <select class="form-select"><option> </option><!></select></label> <label class="booking-field"> <select class="form-select"><option> </option><option> </option><option> </option><option> </option><option> </option><option> </option></select></label> <p class="booking-toolbar__hint"><i class="fa fa-filter" aria-hidden="true"></i> </p></div> <!></div> <div id="booking-panel-facilities" class="booking-panel" role="tabpanel" aria-labelledby="booking-tab-facilities" tabindex="0"><div class="booking-section-heading"><div><h2> </h2><p> </p></div> <button class="btn btn-primary" type="button"><i class="fa fa-plus" aria-hidden="true"></i> </button></div> <div class="booking-table-wrap"><div class="booking-table-scroll"><table class="booking-table"><thead><tr><th> </th><th> </th><th> </th><th> </th><th> </th></tr></thead><tbody><!></tbody></table></div></div> <!></div> <div id="booking-panel-blocks" class="booking-panel" role="tabpanel" aria-labelledby="booking-tab-blocks" tabindex="0"><div class="booking-section-heading"><div><h2> </h2><p> </p></div></div> <div class="booking-card"><div class="booking-card__heading"><span class="booking-card__icon" aria-hidden="true"><i class="fa fa-calendar-times-o"></i></span><div><h3> </h3><p> </p></div></div> <form class="block-form"><label> <select class="form-select" name="facility_id" required=""><option> </option><!></select></label> <label> <select class="form-select" name="resource_id"><option> </option><!></select></label> <label> <input class="form-control" name="start" type="datetime-local" required=""/></label> <label> <input class="form-control" name="end" type="datetime-local" required=""/></label> <label class="block-form__title"> <input class="form-control" name="title" maxlength="255" required=""/></label> <button class="btn btn-primary" type="submit"><i class="fa fa-plus" aria-hidden="true"></i> </button></form></div> <div class="booking-card"><div class="booking-card__heading"><span class="booking-card__icon" aria-hidden="true"><i class="fa fa-repeat"></i></span><div><h3> </h3><p> </p></div></div> <form class="block-form"><label> <select class="form-select" name="facility_id" required=""><option> </option><!></select></label> <label> <select class="form-select" name="resource_id"><option> </option><!></select></label> <label> <select class="form-select" name="weekday"></select></label> <label> <input class="form-control" name="start_time" type="time" required=""/></label> <label> <input class="form-control" name="end_time" type="time" required=""/></label> <label class="block-form__title"> <input class="form-control" name="title" maxlength="255" required=""/></label> <button class="btn btn-primary" type="submit"><i class="fa fa-plus" aria-hidden="true"></i> </button></form></div> <div class="booking-card booking-block-list"><div class="booking-card__heading"><div><h3> </h3><p> </p></div></div> <div class="booking-table-wrap"><div class="booking-table-scroll"><table class="booking-table"><thead><tr><th> </th><th> </th><th> </th><th> </th><th> </th><th> </th></tr></thead><tbody><!></tbody></table></div></div></div></div> <!> <dialog class="booking-dialog booking-detail-dialog"><!></dialog></main>`);
  function BookingAdmin($$anchor, $$props) {
    push($$props, false);
    let adminLocale = /* @__PURE__ */ mutable_source(getAdminLocale());
    let activeTab = /* @__PURE__ */ mutable_source("bookings");
    let facilities = /* @__PURE__ */ mutable_source([]);
    let bookings = /* @__PURE__ */ mutable_source([]);
    let calendarBookings = /* @__PURE__ */ mutable_source([]);
    let blocks = /* @__PURE__ */ mutable_source([]);
    let recurring = /* @__PURE__ */ mutable_source([]);
    let migration = /* @__PURE__ */ mutable_source(null);
    let notice = /* @__PURE__ */ mutable_source(null);
    let facilityFilter = /* @__PURE__ */ mutable_source("");
    let statusFilter = /* @__PURE__ */ mutable_source("");
    let bookingView = /* @__PURE__ */ mutable_source("table");
    let calendarMonth = /* @__PURE__ */ mutable_source(new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1));
    let isLoadingCalendarBookings = /* @__PURE__ */ mutable_source(false);
    let calendarRequestId = 0;
    let offset = /* @__PURE__ */ mutable_source(0);
    let totalBookings = /* @__PURE__ */ mutable_source(0);
    let isLoadingBookings = /* @__PURE__ */ mutable_source(true);
    let isLoadingFacilities = /* @__PURE__ */ mutable_source(true);
    let isLoadingBlocks = /* @__PURE__ */ mutable_source(true);
    let editingFacility = /* @__PURE__ */ mutable_source(null);
    let bookingDialogOpen = /* @__PURE__ */ mutable_source(false);
    let activeBooking = /* @__PURE__ */ mutable_source(null);
    let detailDialog = /* @__PURE__ */ mutable_source();
    let details = /* @__PURE__ */ mutable_source(null);
    let fixedBlockForm = /* @__PURE__ */ mutable_source();
    let recurringBlockForm = /* @__PURE__ */ mutable_source();
    let fixedBlockFacility = /* @__PURE__ */ mutable_source("");
    let recurringBlockFacility = /* @__PURE__ */ mutable_source("");
    onMount(() => {
      const unsubscribe = window.__GRAV_I18N?.subscribe?.((locale) => {
        set(adminLocale, locale);
      });
      void refreshAll();
      return unsubscribe;
    });
    function tr(key, values) {
      return translate(get(adminLocale), `PLUGIN_BOOKING.ADMIN.UI.${key}`, values);
    }
    function statusLabel(status) {
      const key = {
        verification_pending: "STATUS_VERIFICATION_PENDING",
        pending: "STATUS_PENDING",
        confirmed: "STATUS_CONFIRMED",
        rejected: "STATUS_REJECTED",
        cancelled: "STATUS_CANCELLED"
      };
      return translate(get(adminLocale), `PLUGIN_BOOKING.ADMIN.${key[status]}`);
    }
    function modeLabel(mode) {
      const keys = {
        facility: "MODE_FACILITY",
        resources: "MODE_RESOURCES",
        both: "MODE_BOTH",
        manual: "APPROVAL_MANUAL",
        automatic: "APPROVAL_AUTOMATIC"
      };
      return tr(keys[mode] || mode.toUpperCase());
    }
    function format(value, zone) {
      return formatDate(value, zone, dateLocale(get(adminLocale)));
    }
    function weekday(index2, short = false) {
      return weekdayName(get(adminLocale), index2, short);
    }
    function setNotice(message, kind = "info") {
      set(notice, { message, kind });
    }
    async function refreshAll() {
      await Promise.allSettled([
        loadFacilities(),
        loadBookings(),
        loadBlocks(),
        loadMigration()
      ]);
    }
    async function loadFacilities() {
      set(isLoadingFacilities, true);
      try {
        const result = await api("/admin/facilities");
        set(facilities, result.facilities || []);
      } catch (error) {
        setNotice(`${tr("LOAD_FACILITIES_FAILED")} ${errorMessage(error)}`, "danger");
      } finally {
        set(isLoadingFacilities, false);
      }
    }
    async function loadBookings() {
      set(isLoadingBookings, true);
      const query = new URLSearchParams({ limit: "100", offset: String(get(offset)) });
      if (get(facilityFilter)) query.set("facility_id", get(facilityFilter));
      if (get(statusFilter)) query.set("status", get(statusFilter));
      try {
        const result = await api(`/admin/bookings?${query}`);
        set(bookings, result.bookings || []);
        set(totalBookings, Number(result.total ?? get(bookings).length));
      } catch (error) {
        set(bookings, []);
        set(totalBookings, 0);
        setNotice(`${tr("LOAD_BOOKINGS_FAILED")} ${errorMessage(error)}`, "danger");
      } finally {
        set(isLoadingBookings, false);
        if (get(bookingView) === "calendar") void loadCalendarBookings();
      }
    }
    async function loadCalendarBookings() {
      const requestId = ++calendarRequestId;
      set(isLoadingCalendarBookings, true);
      set(calendarBookings, []);
      const year = get(calendarMonth).getFullYear();
      const month = get(calendarMonth).getMonth();
      const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
      const monthLength = new Date(year, month + 1, 0).getDate();
      const visibleDays = Math.ceil((firstDayOffset + monthLength) / 7) * 7;
      const firstVisibleDay = new Date(Date.UTC(year, month, 1 - firstDayOffset - 2));
      const dayAfterVisibleRange = new Date(Date.UTC(year, month, 1 - firstDayOffset + visibleDays + 2));
      const query = new URLSearchParams({
        limit: "200",
        offset: "0",
        from: firstVisibleDay.toISOString(),
        to: dayAfterVisibleRange.toISOString()
      });
      if (get(facilityFilter)) query.set("facility_id", get(facilityFilter));
      if (get(statusFilter)) query.set("status", get(statusFilter));
      try {
        const result = await api(`/admin/bookings?${query}`);
        const allBookings = result.bookings || [];
        const total = Number(result.total ?? allBookings.length);
        for (let nextOffset = allBookings.length; nextOffset < total; nextOffset += 200) {
          const pageQuery = new URLSearchParams(query);
          pageQuery.set("offset", String(nextOffset));
          const page = await api(`/admin/bookings?${pageQuery}`);
          if (requestId !== calendarRequestId) return;
          const pageBookings = page.bookings || [];
          if (pageBookings.length === 0) break;
          allBookings.push(...pageBookings);
        }
        if (requestId === calendarRequestId) set(calendarBookings, allBookings);
      } catch (error) {
        if (requestId === calendarRequestId) {
          set(calendarBookings, []);
          setNotice(`${tr("LOAD_BOOKINGS_FAILED")} ${errorMessage(error)}`, "danger");
        }
      } finally {
        if (requestId === calendarRequestId) set(isLoadingCalendarBookings, false);
      }
    }
    function setBookingView(view) {
      set(bookingView, view);
      if (view === "calendar") void loadCalendarBookings();
    }
    function changeCalendarMonth(direction) {
      set(calendarMonth, new Date(get(calendarMonth).getFullYear(), get(calendarMonth).getMonth() + direction, 1));
      void loadCalendarBookings();
    }
    function showCurrentCalendarMonth() {
      set(calendarMonth, new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1));
      void loadCalendarBookings();
    }
    async function loadBlocks() {
      set(isLoadingBlocks, true);
      try {
        const result = await api("/admin/blocks");
        set(blocks, result.blocks || []);
        set(recurring, result.recurring_blocks || []);
      } catch (error) {
        setNotice(`${tr("LOAD_BLOCKS_FAILED")} ${errorMessage(error)}`, "danger");
      } finally {
        set(isLoadingBlocks, false);
      }
    }
    async function loadMigration() {
      try {
        const result = await api("/admin/migration/preview");
        set(migration, result.migration || null);
      } catch (error) {
        setNotice(`${tr("LOAD_MIGRATION_FAILED")} ${errorMessage(error)}`, "warning");
      }
    }
    function migrationCount() {
      return Object.values(get(migration)?.source_counts || {}).reduce((sum, value) => sum + Number(value || 0), 0);
    }
    function defaultFacility() {
      return {
        id: "",
        name: "",
        description: "",
        enabled: true,
        timezone: "Europe/Prague",
        booking_mode: "facility",
        approval_mode: "manual",
        availability_windows: [{ start: "mon 00:00", end: "sun 23:59" }],
        booking_rules: {
          minimum_duration_seconds: 3600,
          maximum_duration_seconds: 259200,
          booking_interval_seconds: 1800,
          minimum_advance_notice_seconds: 0,
          maximum_horizon_seconds: 7776e3,
          pending_blocks_availability: true
        },
        resources: [],
        booking_interface: defaultBookingInterface("simple", get(adminLocale)),
        access: {
          guest_requests: true,
          allowed_groups: [],
          instant_approval_groups: []
        },
        notifications: {
          enabled: true,
          admin_recipients: [],
          facility_events: ["created"],
          requester_events: ["created", "confirmed"]
        }
      };
    }
    function openFacility(id = "") {
      const existing = get(facilities).find((facility) => facility.id === id);
      set(editingFacility, existing ? structuredClone(existing) : defaultFacility());
      requestAnimationFrame(() => document.querySelector(".booking-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    function parseFacility(values) {
      const read = (name) => String(values.get(name) || "").trim();
      const checked = (name) => values.has(name);
      const csv = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);
      const windows = read("windows").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
        const parts = line.split(/\s+-\s+/);
        if (parts.length !== 2) throw new Error(tr("INVALID_AVAILABILITY_WINDOW"));
        return { start: parts[0], end: parts[1] };
      });
      const resources = read("resources").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
        const [
          id,
          name,
          description = "",
          allowed = "",
          instant = "",
          enabled = "true"
        ] = line.split("|").map((part) => part.trim());
        if (!id || !name) throw new Error(tr("ROOM_ID_AND_NAME_REQUIRED"));
        return {
          id,
          name,
          description,
          enabled: enabled.toLowerCase() !== "false",
          allowed_groups: csv(allowed),
          instant_approval_groups: csv(instant)
        };
      });
      const slotIds = values.getAll("simple_slot_id").map(String);
      const slotLabels = values.getAll("simple_slot_label").map(String);
      const slotStarts = values.getAll("simple_slot_start").map(String);
      const slotEnds = values.getAll("simple_slot_end").map(String);
      const resourceSlots = slotIds.map((id, index2) => {
        const label = slotLabels[index2]?.trim() || "";
        const start_time = slotStarts[index2] || "";
        const end_time = slotEnds[index2] || "";
        if (!id || !label || !/^([01]\d|2[0-3]):[0-5]\d$/.test(start_time) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end_time) || end_time <= start_time) {
          throw new Error(tr("INVALID_SIMPLE_SLOT"));
        }
        return { id, label, start_time, end_time };
      });
      if (resourceSlots.length === 0) throw new Error(tr("AT_LEAST_ONE_SIMPLE_SLOT"));
      if (new Set(resourceSlots.map((slot) => slot.id)).size !== resourceSlots.length) throw new Error(tr("INVALID_SIMPLE_SLOT"));
      const wholeDayStartTime = read("whole_day_start_time");
      const wholeDayEndTime = read("whole_day_end_time");
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(wholeDayStartTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(wholeDayEndTime)) {
        throw new Error(tr("INVALID_WHOLE_DAY_TIMES"));
      }
      const events = (name) => values.getAll(name).map(String);
      const minutes = (name, fallback) => Math.max(1, Number(read(name)) || fallback);
      return {
        id: read("id"),
        name: read("name"),
        description: read("description"),
        timezone: read("timezone"),
        enabled: checked("enabled"),
        booking_mode: read("booking_mode"),
        approval_mode: read("approval_mode"),
        booking_interface: {
          default_mode: read("booking_default_mode") === "simple" ? "simple" : "custom",
          whole_day_start_time: wholeDayStartTime,
          whole_day_end_time: wholeDayEndTime,
          resource_slots: resourceSlots
        },
        availability_windows: windows,
        resources,
        booking_rules: {
          minimum_duration_seconds: minutes("minimum_duration", 60) * 60,
          maximum_duration_seconds: minutes("maximum_duration", 4320) * 60,
          booking_interval_seconds: minutes("booking_interval", 30) * 60,
          minimum_advance_notice_seconds: Math.max(0, Number(read("minimum_notice")) || 0) * 3600,
          maximum_horizon_seconds: minutes("horizon", 90) * 86400,
          pending_blocks_availability: true
        },
        access: {
          guest_requests: checked("guest_requests"),
          allowed_groups: csv(read("allowed_groups")),
          instant_approval_groups: csv(read("instant_groups"))
        },
        notifications: {
          enabled: checked("notifications_enabled"),
          admin_recipients: csv(read("recipients")),
          facility_events: events("facility_events"),
          requester_events: events("requester_events"),
          templates: Object.fromEntries([
            "email_layout_html",
            "verification_subject",
            "verification_body",
            "created_admin_subject",
            "created_admin_body",
            "created_requester_subject",
            "created_requester_body",
            "confirmed_subject",
            "confirmed_body_html",
            "payment_subject",
            "payment_body_html",
            "rejected_subject",
            "rejected_body",
            "cancelled_subject",
            "cancelled_body",
            "edited_subject",
            "edited_body"
          ].map((key) => [key, String(values.get(`template_${key}`) || "")]))
        }
      };
    }
    async function saveFacility(values) {
      try {
        const body = parseFacility(values);
        const id = get(editingFacility)?.id || "";
        await api(
          id ? `/admin/facilities/${encodeURIComponent(id)}` : "/admin/facilities",
          { method: id ? "PUT" : "POST", body }
        );
        set(editingFacility, null);
        setNotice(tr("FACILITY_SAVED"), "success");
        await loadFacilities();
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    async function deleteFacility(id) {
      if (!await confirmAction({
        title: tr("DELETE_FACILITY_TITLE"),
        message: tr("DELETE_FACILITY_MESSAGE"),
        confirmLabel: tr("DELETE_FACILITY"),
        variant: "destructive"
      })) return;
      try {
        await api(`/admin/facilities/${encodeURIComponent(id)}`, { method: "DELETE" });
        await loadFacilities();
        setNotice(tr("FACILITY_DELETED"), "success");
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    function openBooking(booking = null) {
      if (get(facilities).length === 0) {
        set(activeTab, "facilities");
        setNotice(tr("ADD_FACILITY_BEFORE_BOOKING"), "warning");
        return;
      }
      set(activeBooking, booking);
      set(bookingDialogOpen, true);
    }
    async function saveBooking(values) {
      try {
        const facilityId = String(values.get("facility_id") || "");
        const facility = get(facilities).find((item) => item.id === facilityId);
        if (!facility) throw new Error(tr("CHOOSE_FACILITY"));
        const body = {
          facility_id: facilityId,
          resource_id: String(values.get("resource_id") || "") || null,
          start: toInstant(String(values.get("start") || ""), facility.timezone, {
            missing: tr("ENTER_START_AND_END"),
            daylightSaving: tr("DAYLIGHT_SAVING_GAP")
          }),
          end: toInstant(String(values.get("end") || ""), facility.timezone, {
            missing: tr("ENTER_START_AND_END"),
            daylightSaving: tr("DAYLIGHT_SAVING_GAP")
          }),
          customer_name: String(values.get("customer_name") || ""),
          customer_email: String(values.get("customer_email") || ""),
          customer_phone: String(values.get("customer_phone") || "") || null,
          customer_note: String(values.get("customer_note") || "") || null
        };
        if (get(activeBooking)) {
          body.admin_note = String(values.get("admin_note") || "") || null;
          await api(`/admin/bookings/${encodeURIComponent(get(activeBooking).id)}`, { method: "PATCH", body });
        } else {
          body.status = String(values.get("status") || "pending");
          await api("/admin/bookings", { method: "POST", body });
        }
        set(bookingDialogOpen, false);
        setNotice(get(activeBooking) ? tr("BOOKING_UPDATED") : tr("BOOKING_CREATED"), "success");
        set(activeBooking, null);
        await loadBookings();
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    async function changeStatus(booking, status) {
      const keys = {
        confirmed: {
          title: "APPROVE_BOOKING_TITLE",
          message: "APPROVE_BOOKING_MESSAGE",
          confirm: "APPROVE"
        },
        rejected: {
          title: "REJECT_BOOKING_TITLE",
          message: "REJECT_BOOKING_MESSAGE",
          confirm: "REJECT"
        },
        cancelled: {
          title: "REVOKE_BOOKING_TITLE",
          message: "REVOKE_BOOKING_MESSAGE",
          confirm: "REVOKE"
        }
      };
      const labels = keys[status];
      if (!await confirmAction({
        title: tr(labels.title),
        message: tr(labels.message),
        confirmLabel: tr(labels.confirm),
        variant: status === "confirmed" ? "default" : "destructive"
      })) return;
      try {
        await api(`/admin/bookings/${encodeURIComponent(booking.id)}/status`, { method: "PATCH", body: { status } });
        setNotice(tr("BOOKING_STATUS_UPDATED"), "success");
        await loadBookings();
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    async function deleteBooking(booking) {
      if (!await confirmAction({
        title: tr("DELETE_BOOKING_TITLE"),
        message: tr("DELETE_BOOKING_MESSAGE"),
        confirmLabel: tr("DELETE_BOOKING"),
        variant: "destructive"
      })) return;
      try {
        await api(`/admin/bookings/${encodeURIComponent(booking.id)}`, { method: "DELETE" });
        setNotice(tr("BOOKING_DELETED"), "success");
        await loadBookings();
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    async function showDetails(id) {
      try {
        set(details, await api(`/admin/bookings/${encodeURIComponent(id)}`));
        get(detailDialog)?.showModal();
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    async function sendPaymentInformation(booking) {
      try {
        await api(`/admin/bookings/${encodeURIComponent(booking.id)}/payment-email`, { method: "POST", body: {} });
        setNotice(tr("PAYMENT_EMAIL_SENT"), "success");
        set(details, await api(`/admin/bookings/${encodeURIComponent(booking.id)}`));
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    async function importLegacy() {
      if (!await confirmAction({
        title: tr("IMPORT_LEGACY_TITLE"),
        message: tr("IMPORT_LEGACY_MESSAGE"),
        confirmLabel: tr("IMPORT_DATA")
      })) return;
      try {
        const result = await api("/admin/migration/import", { method: "POST", body: {} });
        const imported = result.migration?.imported || {};
        setNotice(
          tr("LEGACY_IMPORTED", {
            facilities: imported.facilities || 0,
            bookings: imported.bookings || 0,
            blocks: imported.blocks || 0
          }),
          "success"
        );
        await refreshAll();
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    async function submitFixedBlock(event2) {
      event2.preventDefault();
      const values = new FormData(get(fixedBlockForm));
      try {
        const facility = get(facilities).find((item) => item.id === String(values.get("facility_id")));
        if (!facility) throw new Error(tr("CHOOSE_FACILITY"));
        await api("/admin/blocks/fixed", {
          method: "POST",
          body: {
            facility_id: values.get("facility_id"),
            resource_id: values.get("resource_id") || null,
            start: toInstant(String(values.get("start") || ""), facility.timezone, {
              missing: tr("ENTER_START_AND_END"),
              daylightSaving: tr("DAYLIGHT_SAVING_GAP")
            }),
            end: toInstant(String(values.get("end") || ""), facility.timezone, {
              missing: tr("ENTER_START_AND_END"),
              daylightSaving: tr("DAYLIGHT_SAVING_GAP")
            }),
            title: values.get("title")
          }
        });
        get(fixedBlockForm).reset();
        set(fixedBlockFacility, "");
        setNotice(tr("BLOCK_ADDED"), "success");
        await loadBlocks();
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    async function submitRecurringBlock(event2) {
      event2.preventDefault();
      const values = new FormData(get(recurringBlockForm));
      try {
        await api("/admin/blocks/recurring", {
          method: "POST",
          body: {
            facility_id: values.get("facility_id"),
            resource_id: values.get("resource_id") || null,
            weekday: Number(values.get("weekday")),
            start_time: values.get("start_time"),
            end_time: values.get("end_time"),
            title: values.get("title")
          }
        });
        get(recurringBlockForm).reset();
        set(recurringBlockFacility, "");
        setNotice(tr("RECURRING_BLOCK_ADDED"), "success");
        await loadBlocks();
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    async function deleteBlock(kind, id) {
      if (!await confirmAction({
        title: tr("REMOVE_BLOCK_TITLE"),
        message: tr("REMOVE_BLOCK_MESSAGE"),
        confirmLabel: tr("REMOVE_BLOCK"),
        variant: "destructive"
      })) return;
      try {
        await api(`/admin/blocks/${kind}/${encodeURIComponent(id)}`, { method: "DELETE" });
        await loadBlocks();
      } catch (error) {
        setNotice(errorMessage(error), "danger");
      }
    }
    function facilityName(id) {
      return get(facilities).find((facility) => facility.id === id)?.name || id || "—";
    }
    function resourceName(facilityId, resourceId) {
      return get(facilities).find((facility) => facility.id === facilityId)?.resources?.find((resource) => resource.id === resourceId)?.name || (resourceId || tr("ALL_ROOMS"));
    }
    function eventLabel(event2) {
      const key = `EVENT_${event2.toUpperCase()}`;
      return tr(key);
    }
    function notificationStatus(status) {
      const key = {
        pending: "EMAIL_PENDING",
        sent: "EMAIL_SENT",
        failed: "EMAIL_FAILED"
      };
      return key[status] ? tr(key[status]) : status;
    }
    function hasBookingFilters() {
      return Boolean(get(facilityFilter) || get(statusFilter));
    }
    function handleFilterChange() {
      set(offset, 0);
      void loadBookings();
    }
    function changePage(direction) {
      set(offset, Math.max(0, get(offset) + direction * 100));
      void loadBookings();
    }
    function handleTabKey(event2) {
      const target = event2.currentTarget;
      const tabs = ["bookings", "facilities", "blocks"];
      const current = tabs.indexOf(target.dataset.tab);
      const rtl = (window.__GRAV_I18N?.dir || document.documentElement.dir) === "rtl";
      let next = current;
      if (event2.key === "Home") next = 0;
      else if (event2.key === "End") next = tabs.length - 1;
      else if (event2.key === "ArrowRight") next = (current + (rtl ? -1 : 1) + tabs.length) % tabs.length;
      else if (event2.key === "ArrowLeft") next = (current + (rtl ? 1 : -1) + tabs.length) % tabs.length;
      else return;
      event2.preventDefault();
      set(activeTab, tabs[next]);
      document.getElementById(`booking-tab-${get(activeTab)}`)?.focus();
    }
    function errorMessage(error) {
      return error instanceof Error ? error.message : String(error);
    }
    init();
    var main = root_30();
    var p = child(main);
    var text$1 = only_child(p, true);
    var node = sibling(p, 2);
    {
      var consequent_4 = ($$anchor2) => {
        var section = root_3();
        var div = child(section);
        var strong = child(div);
        var text_1 = only_child(strong, true);
        var p_1 = sibling(strong);
        var text_2 = only_child(p_1, true);
        var node_1 = sibling(p_1, 2);
        {
          var consequent = ($$anchor3) => {
            var p_2 = root();
            var text_3 = only_child(p_2);
            template_effect(($0, $1) => set_text(text_3, `${$0 ?? ""} ${$1 ?? ""}`), [
              () => tr("IMPORT_NEEDS_ATTENTION"),
              () => get(migration).errors.map((item) => `${item.source}: ${item.message}`).join("; ")
            ]);
            append($$anchor3, p_2);
          };
          if_block(node_1, ($$render) => {
            if (get(migration).errors?.length) $$render(consequent);
          });
        }
        var node_2 = sibling(node_1, 2);
        {
          var consequent_1 = ($$anchor3) => {
            var p_3 = root();
            var text_4 = only_child(p_3, true);
            template_effect(($0) => set_text(text_4, $0), [() => tr("LEGACY_ALREADY_IMPORTED")]);
            append($$anchor3, p_3);
          };
          if_block(node_2, ($$render) => {
            if (get(migration).already_imported) $$render(consequent_1);
          });
        }
        var node_3 = sibling(node_2, 2);
        {
          var consequent_2 = ($$anchor3) => {
            var p_4 = root_1();
            var text_5 = only_child(p_4, true);
            template_effect(($0) => set_text(text_5, $0), [() => tr("LEGACY_FILES_PRESERVED")]);
            append($$anchor3, p_4);
          };
          if_block(node_3, ($$render) => {
            if (get(migration).can_import && !get(migration).already_imported) $$render(consequent_2);
          });
        }
        var node_4 = sibling(div, 2);
        {
          var consequent_3 = ($$anchor3) => {
            var button = root_2();
            var text_6 = sibling(child(button));
            template_effect(($0) => set_text(text_6, ` ${$0 ?? ""}`), [() => tr("IMPORT_LEGACY_DATA")]);
            delegated("click", button, importLegacy);
            append($$anchor3, button);
          };
          if_block(node_4, ($$render) => {
            if (get(migration).can_import && !get(migration).already_imported) $$render(consequent_3);
          });
        }
        template_effect(
          ($0, $1) => {
            set_class(section, 1, `booking-alert booking-alert--${get(migration).errors?.length ? "warning" : "info"}`);
            set_text(text_1, $0);
            set_text(text_2, $1);
          },
          [
            () => tr("LEGACY_DATA_IMPORT"),
            () => tr("LEGACY_COUNTS", {
              facilities: get(migration).source_counts?.facilities || 0,
              bookings: get(migration).source_counts?.bookings || 0,
              blocks: get(migration).source_counts?.blocks || 0,
              recurring: get(migration).source_counts?.recurring_blocks || 0
            })
          ]
        );
        append($$anchor2, section);
      };
      var d = /* @__PURE__ */ user_derived(() => get(migration) && (migrationCount() > 0 || get(migration).errors?.length));
      if_block(node, ($$render) => {
        if (get(d)) $$render(consequent_4);
      });
    }
    var node_5 = sibling(node, 2);
    {
      var consequent_5 = ($$anchor2) => {
        var div_1 = root_4();
        var text_7 = child(div_1);
        var button_1 = sibling(text_7);
        template_effect(
          ($0) => {
            set_class(div_1, 1, `booking-alert booking-alert--${get(notice).kind ?? ""}`);
            set_text(text_7, get(notice).message);
            set_attribute(button_1, "aria-label", $0);
          },
          [() => tr("DISMISS_MESSAGE")]
        );
        delegated("click", button_1, () => set(notice, null));
        append($$anchor2, div_1);
      };
      if_block(node_5, ($$render) => {
        if (get(notice)) $$render(consequent_5);
      });
    }
    var div_2 = sibling(node_5, 2);
    var button_2 = child(div_2);
    let classes;
    var span = sibling(child(button_2));
    var text_8 = only_child(span, true);
    var span_1 = sibling(span);
    var text_9 = only_child(span_1, true);
    var button_3 = sibling(button_2, 2);
    let classes_1;
    var span_2 = sibling(child(button_3));
    var text_10 = only_child(span_2, true);
    var span_3 = sibling(span_2);
    var text_11 = only_child(span_3, true);
    var button_4 = sibling(button_3, 2);
    let classes_2;
    var span_4 = sibling(child(button_4));
    var text_12 = only_child(span_4, true);
    var div_3 = sibling(div_2, 2);
    var div_4 = child(div_3);
    var div_5 = child(div_4);
    var h2 = child(div_5);
    var text_13 = only_child(h2, true);
    var p_5 = sibling(h2);
    var text_14 = only_child(p_5, true);
    var div_6 = sibling(div_5, 2);
    var div_7 = child(div_6);
    var button_5 = child(div_7);
    let classes_3;
    var text_15 = sibling(child(button_5));
    var button_6 = sibling(button_5, 2);
    let classes_4;
    var text_16 = sibling(child(button_6));
    var button_7 = sibling(div_7, 2);
    var text_17 = sibling(child(button_7));
    var button_8 = sibling(button_7, 2);
    var text_18 = sibling(child(button_8));
    var div_8 = sibling(div_4, 2);
    var label_1 = child(div_8);
    var text_19 = child(label_1);
    var select = sibling(text_19);
    var option = child(select);
    var text_20 = only_child(option, true);
    option.value = option.__value = "";
    var node_6 = sibling(option);
    each(node_6, 1, () => get(facilities), (facility) => facility.id, ($$anchor2, facility) => {
      var option_1 = root_5();
      var text_21 = only_child(option_1, true);
      var option_1_value = {};
      template_effect(() => {
        set_text(text_21, get(facility).name);
        if (option_1_value !== (option_1_value = get(facility).id)) {
          option_1.value = (option_1.__value = option_1_value) ?? "";
        }
      });
      append($$anchor2, option_1);
    });
    init_select(select);
    var label_2 = sibling(label_1, 2);
    var text_22 = child(label_2);
    var select_1 = sibling(text_22);
    var option_2 = child(select_1);
    var text_23 = only_child(option_2, true);
    option_2.value = option_2.__value = "";
    var option_3 = sibling(option_2);
    var text_24 = only_child(option_3, true);
    option_3.value = option_3.__value = "verification_pending";
    var option_4 = sibling(option_3);
    var text_25 = only_child(option_4, true);
    option_4.value = option_4.__value = "pending";
    var option_5 = sibling(option_4);
    var text_26 = only_child(option_5, true);
    option_5.value = option_5.__value = "confirmed";
    var option_6 = sibling(option_5);
    var text_27 = only_child(option_6, true);
    option_6.value = option_6.__value = "rejected";
    var option_7 = sibling(option_6);
    var text_28 = only_child(option_7, true);
    option_7.value = option_7.__value = "cancelled";
    init_select(select_1);
    var p_6 = sibling(label_2, 2);
    var text_29 = sibling(child(p_6));
    var node_7 = sibling(div_8, 2);
    {
      var consequent_6 = ($$anchor2) => {
        BookingCalendar($$anchor2, {
          get bookings() {
            return get(calendarBookings);
          },
          get loading() {
            return get(isLoadingCalendarBookings);
          },
          get month() {
            return get(calendarMonth);
          },
          get locale() {
            return get(adminLocale);
          },
          statusLabel,
          onMonthChange: changeCalendarMonth,
          onToday: showCurrentCalendarMonth,
          onSelectBooking: openBooking
        });
      };
      var alternate_1 = ($$anchor2) => {
        var fragment_1 = root_14();
        var div_9 = first_child(fragment_1);
        var div_10 = child(div_9);
        var table = child(div_10);
        var thead = child(table);
        var tr_1 = child(thead);
        var th = child(tr_1);
        var text_30 = only_child(th, true);
        var th_1 = sibling(th);
        var text_31 = only_child(th_1, true);
        var th_2 = sibling(th_1);
        var text_32 = only_child(th_2, true);
        var th_3 = sibling(th_2);
        var text_33 = only_child(th_3, true);
        var th_4 = sibling(th_3);
        var text_34 = only_child(th_4, true);
        var th_5 = sibling(th_4);
        var text_35 = only_child(th_5, true);
        var th_6 = sibling(th_5);
        var text_36 = only_child(th_6, true);
        var tbody = sibling(thead);
        var node_8 = child(tbody);
        {
          var consequent_7 = ($$anchor3) => {
            var tr_2 = root_6();
            var td = child(tr_2);
            var text_37 = only_child(td, true);
            template_effect(($0) => set_text(text_37, $0), [() => tr("LOADING_BOOKINGS")]);
            append($$anchor3, tr_2);
          };
          var consequent_9 = ($$anchor3) => {
            var tr_3 = root_8();
            var td_1 = child(tr_3);
            var strong_1 = child(td_1);
            var text_38 = only_child(strong_1, true);
            var p_7 = sibling(strong_1, 2);
            var text_39 = only_child(p_7, true);
            var node_9 = sibling(p_7, 2);
            {
              var consequent_8 = ($$anchor4) => {
                var button_9 = root_7();
                var text_40 = sibling(child(button_9));
                template_effect(($0) => set_text(text_40, ` ${$0 ?? ""}`), [() => tr("CREATE_BOOKING")]);
                delegated("click", button_9, () => openBooking());
                append($$anchor4, button_9);
              };
              var d_1 = /* @__PURE__ */ user_derived(() => !hasBookingFilters());
              if_block(node_9, ($$render) => {
                if (get(d_1)) $$render(consequent_8);
              });
            }
            template_effect(
              ($0, $1) => {
                set_text(text_38, $0);
                set_text(text_39, $1);
              },
              [
                () => hasBookingFilters() ? tr("NO_BOOKINGS_MATCH_FILTERS") : tr("NO_BOOKINGS_YET"),
                () => hasBookingFilters() ? tr("CHANGE_BOOKING_FILTERS") : tr("CREATE_OR_WAIT_BOOKING")
              ]
            );
            append($$anchor3, tr_3);
          };
          var alternate = ($$anchor3) => {
            var fragment_2 = comment();
            var node_10 = first_child(fragment_2);
            each(node_10, 1, () => get(bookings), (booking) => booking.id, ($$anchor4, booking) => {
              var tr_4 = root_11();
              var td_2 = child(tr_4);
              var text_41 = only_child(td_2, true);
              var td_3 = sibling(td_2);
              var text_42 = only_child(td_3, true);
              var td_4 = sibling(td_3);
              var strong_2 = child(td_4);
              var text_43 = only_child(strong_2, true);
              var a = sibling(strong_2, 2);
              var text_44 = only_child(a, true);
              var td_5 = sibling(td_4);
              var text_45 = only_child(td_5, true);
              var td_6 = sibling(td_5);
              var text_46 = only_child(td_6, true);
              var td_7 = sibling(td_6);
              var span_5 = child(td_7);
              var text_47 = only_child(span_5, true);
              var td_8 = sibling(td_7);
              var div_11 = child(td_8);
              var button_10 = child(div_11);
              var text_48 = only_child(button_10, true);
              var button_11 = sibling(button_10, 2);
              var text_49 = only_child(button_11, true);
              var node_11 = sibling(button_11, 2);
              {
                var consequent_10 = ($$anchor5) => {
                  var fragment_3 = root_9();
                  var button_12 = first_child(fragment_3);
                  var text_50 = only_child(button_12, true);
                  var button_13 = sibling(button_12, 2);
                  var text_51 = only_child(button_13, true);
                  template_effect(
                    ($0, $1) => {
                      set_text(text_50, $0);
                      set_text(text_51, $1);
                    },
                    [() => tr("APPROVE"), () => tr("REJECT")]
                  );
                  delegated("click", button_12, () => void changeStatus(get(booking), "confirmed"));
                  delegated("click", button_13, () => void changeStatus(get(booking), "rejected"));
                  append($$anchor5, fragment_3);
                };
                if_block(node_11, ($$render) => {
                  if (get(booking).status === "pending") $$render(consequent_10);
                });
              }
              var node_12 = sibling(node_11, 2);
              {
                var consequent_11 = ($$anchor5) => {
                  var button_14 = root_10();
                  var text_52 = only_child(button_14, true);
                  template_effect(($0) => set_text(text_52, $0), [() => tr("REVOKE")]);
                  delegated("click", button_14, () => void changeStatus(get(booking), "cancelled"));
                  append($$anchor5, button_14);
                };
                if_block(node_12, ($$render) => {
                  if (get(booking).status === "pending" || get(booking).status === "confirmed") $$render(consequent_11);
                });
              }
              var button_15 = sibling(node_12, 2);
              var text_53 = only_child(button_15, true);
              template_effect(
                ($0, $1, $2, $3, $4, $5) => {
                  set_text(text_41, get(booking).facility_name);
                  set_text(text_42, get(booking).resource_name || "—");
                  set_text(text_43, get(booking).customer_name);
                  set_attribute(a, "href", `mailto:${get(booking).customer_email ?? ""}`);
                  set_text(text_44, get(booking).customer_email);
                  set_text(text_45, $0);
                  set_text(text_46, $1);
                  set_class(span_5, 1, `status-badge status-badge--${get(booking).status ?? ""}`);
                  set_text(text_47, $2);
                  set_text(text_48, $3);
                  set_text(text_49, $4);
                  set_text(text_53, $5);
                },
                [
                  () => format(get(booking).start, get(booking).timezone),
                  () => format(get(booking).end, get(booking).timezone),
                  () => statusLabel(get(booking).status),
                  () => tr("DETAILS"),
                  () => tr("EDIT"),
                  () => tr("DELETE")
                ]
              );
              delegated("click", button_10, () => void showDetails(get(booking).id));
              delegated("click", button_11, () => openBooking(get(booking)));
              delegated("click", button_15, () => void deleteBooking(get(booking)));
              append($$anchor4, tr_4);
            });
            append($$anchor3, fragment_2);
          };
          if_block(node_8, ($$render) => {
            if (get(isLoadingBookings)) $$render(consequent_7);
            else if (get(bookings).length === 0) $$render(consequent_9, 1);
            else $$render(alternate, -1);
          });
        }
        var footer = sibling(div_9, 2);
        var p_8 = child(footer);
        var text_54 = only_child(p_8, true);
        var div_12 = sibling(p_8, 2);
        var node_13 = child(div_12);
        {
          var consequent_12 = ($$anchor3) => {
            var button_16 = root_12();
            var text_55 = sibling(child(button_16));
            template_effect(($0) => set_text(text_55, ` ${$0 ?? ""}`), [() => tr("PREVIOUS")]);
            delegated("click", button_16, () => changePage(-1));
            append($$anchor3, button_16);
          };
          if_block(node_13, ($$render) => {
            if (get(offset) > 0) $$render(consequent_12);
          });
        }
        var node_14 = sibling(node_13, 2);
        {
          var consequent_13 = ($$anchor3) => {
            var button_17 = root_13();
            var text_56 = child(button_17);
            template_effect(($0) => set_text(text_56, `${$0 ?? ""} `), [() => tr("NEXT")]);
            delegated("click", button_17, () => changePage(1));
            append($$anchor3, button_17);
          };
          if_block(node_14, ($$render) => {
            if (get(offset) + get(bookings).length < get(totalBookings)) $$render(consequent_13);
          });
        }
        template_effect(
          ($0, $1, $2, $3, $4, $5, $6, $7) => {
            set_text(text_30, $0);
            set_text(text_31, $1);
            set_text(text_32, $2);
            set_text(text_33, $3);
            set_text(text_34, $4);
            set_text(text_35, $5);
            set_text(text_36, $6);
            set_text(text_54, $7);
          },
          [
            () => tr("FACILITY"),
            () => tr("ROOM"),
            () => tr("REQUESTER"),
            () => tr("START"),
            () => tr("END"),
            () => tr("STATUS"),
            () => tr("ACTIONS"),
            () => get(totalBookings) === 0 ? tr("NO_BOOKINGS_TO_SHOW") : tr("BOOKINGS_PAGINATION", {
              first: get(offset) + 1,
              last: get(offset) + get(bookings).length,
              total: get(totalBookings)
            })
          ]
        );
        append($$anchor2, fragment_1);
      };
      if_block(node_7, ($$render) => {
        if (get(bookingView) === "calendar") $$render(consequent_6);
        else $$render(alternate_1, -1);
      });
    }
    var div_13 = sibling(div_3, 2);
    var div_14 = child(div_13);
    var div_15 = child(div_14);
    var h2_1 = child(div_15);
    var text_57 = only_child(h2_1, true);
    var p_9 = sibling(h2_1);
    var text_58 = only_child(p_9, true);
    var button_18 = sibling(div_15, 2);
    var text_59 = sibling(child(button_18));
    var div_16 = sibling(div_14, 2);
    var div_17 = child(div_16);
    var table_1 = child(div_17);
    var thead_1 = child(table_1);
    var tr_5 = child(thead_1);
    var th_7 = child(tr_5);
    var text_60 = only_child(th_7, true);
    var th_8 = sibling(th_7);
    var text_61 = only_child(th_8, true);
    var th_9 = sibling(th_8);
    var text_62 = only_child(th_9, true);
    var th_10 = sibling(th_9);
    var text_63 = only_child(th_10, true);
    var th_11 = sibling(th_10);
    var text_64 = only_child(th_11, true);
    var tbody_1 = sibling(thead_1);
    var node_15 = child(tbody_1);
    {
      var consequent_14 = ($$anchor2) => {
        var tr_6 = root_15();
        var td_9 = child(tr_6);
        var text_65 = only_child(td_9, true);
        template_effect(($0) => set_text(text_65, $0), [() => tr("LOADING_FACILITIES")]);
        append($$anchor2, tr_6);
      };
      var consequent_15 = ($$anchor2) => {
        var tr_7 = root_16();
        var td_10 = child(tr_7);
        var strong_3 = child(td_10);
        var text_66 = only_child(strong_3, true);
        var p_10 = sibling(strong_3, 2);
        var text_67 = only_child(p_10, true);
        var button_19 = sibling(p_10, 2);
        var text_68 = sibling(child(button_19));
        template_effect(
          ($0, $1, $2) => {
            set_text(text_66, $0);
            set_text(text_67, $1);
            set_text(text_68, ` ${$2 ?? ""}`);
          },
          [
            () => tr("FIRST_FACILITY_TITLE"),
            () => tr("FIRST_FACILITY_DESCRIPTION"),
            () => tr("ADD_FACILITY")
          ]
        );
        delegated("click", button_19, () => openFacility());
        append($$anchor2, tr_7);
      };
      var alternate_2 = ($$anchor2) => {
        var fragment_4 = comment();
        var node_16 = first_child(fragment_4);
        each(node_16, 1, () => get(facilities), (facility) => facility.id, ($$anchor3, facility) => {
          var tr_8 = root_19();
          var td_11 = child(tr_8);
          var strong_4 = child(td_11);
          var text_69 = only_child(strong_4, true);
          var code = sibling(strong_4, 2);
          var text_70 = only_child(code, true);
          var node_17 = sibling(code);
          {
            var consequent_16 = ($$anchor4) => {
              var span_6 = root_17();
              var text_71 = only_child(span_6, true);
              template_effect(($0) => set_text(text_71, $0), [() => tr("DISABLED")]);
              append($$anchor4, span_6);
            };
            if_block(node_17, ($$render) => {
              if (!get(facility).enabled) $$render(consequent_16);
            });
          }
          var td_12 = sibling(td_11);
          var text_72 = only_child(td_12, true);
          var td_13 = sibling(td_12);
          var span_7 = child(td_13);
          var text_73 = only_child(span_7, true);
          var td_14 = sibling(td_13);
          each(td_14, 5, () => get(facility).availability_windows, index, ($$anchor4, window2) => {
            var span_8 = root_18();
            var text_74 = only_child(span_8);
            template_effect(() => set_text(text_74, `${get(window2).start ?? ""} – ${get(window2).end ?? ""}`));
            append($$anchor4, span_8);
          });
          var td_15 = sibling(td_14);
          var div_18 = child(td_15);
          var button_20 = child(div_18);
          var text_75 = only_child(button_20, true);
          var button_21 = sibling(button_20, 2);
          var text_76 = only_child(button_21, true);
          template_effect(
            ($0, $1, $2, $3) => {
              set_text(text_69, get(facility).name);
              set_text(text_70, get(facility).id);
              set_text(text_72, $0);
              set_class(span_7, 1, `status-badge status-badge--${get(facility).approval_mode ?? ""}`);
              set_text(text_73, $1);
              set_text(text_75, $2);
              set_text(text_76, $3);
            },
            [
              () => modeLabel(get(facility).booking_mode),
              () => modeLabel(get(facility).approval_mode),
              () => tr("EDIT"),
              () => tr("DELETE")
            ]
          );
          delegated("click", button_20, () => openFacility(get(facility).id));
          delegated("click", button_21, () => void deleteFacility(get(facility).id));
          append($$anchor3, tr_8);
        });
        append($$anchor2, fragment_4);
      };
      if_block(node_15, ($$render) => {
        if (get(isLoadingFacilities)) $$render(consequent_14);
        else if (get(facilities).length === 0) $$render(consequent_15, 1);
        else $$render(alternate_2, -1);
      });
    }
    var node_18 = sibling(div_16, 2);
    {
      var consequent_17 = ($$anchor2) => {
        var div_19 = root_20();
        var node_19 = child(div_19);
        FacilityEditor(node_19, {
          get facility() {
            return get(editingFacility);
          },
          get locale() {
            return get(adminLocale);
          },
          onSave: saveFacility,
          onClose: () => set(editingFacility, null)
        });
        append($$anchor2, div_19);
      };
      if_block(node_18, ($$render) => {
        if (get(editingFacility)) $$render(consequent_17);
      });
    }
    var div_20 = sibling(div_13, 2);
    var div_21 = child(div_20);
    var div_22 = child(div_21);
    var h2_2 = child(div_22);
    var text_77 = only_child(h2_2, true);
    var p_11 = sibling(h2_2);
    var text_78 = only_child(p_11, true);
    var div_23 = sibling(div_21, 2);
    var div_24 = child(div_23);
    var div_25 = sibling(child(div_24));
    var h3 = child(div_25);
    var text_79 = only_child(h3, true);
    var p_12 = sibling(h3);
    var text_80 = only_child(p_12, true);
    var form = sibling(div_24, 2);
    var label_3 = child(form);
    var text_81 = child(label_3);
    var select_2 = sibling(text_81);
    var option_8 = child(select_2);
    var text_82 = only_child(option_8, true);
    option_8.value = option_8.__value = "";
    var node_20 = sibling(option_8);
    each(node_20, 1, () => get(facilities), (facility) => facility.id, ($$anchor2, facility) => {
      var option_9 = root_5();
      var text_83 = only_child(option_9, true);
      var option_9_value = {};
      template_effect(() => {
        set_text(text_83, get(facility).name);
        if (option_9_value !== (option_9_value = get(facility).id)) {
          option_9.value = (option_9.__value = option_9_value) ?? "";
        }
      });
      append($$anchor2, option_9);
    });
    init_select(select_2);
    var label_4 = sibling(label_3, 2);
    var text_84 = child(label_4);
    var select_3 = sibling(text_84);
    var option_10 = child(select_3);
    var text_85 = only_child(option_10, true);
    option_10.value = option_10.__value = "";
    var node_21 = sibling(option_10);
    each(node_21, 1, () => get(facilities).find((facility) => facility.id === get(fixedBlockFacility))?.resources || [], (resource) => resource.id, ($$anchor2, resource) => {
      var option_11 = root_5();
      var text_86 = only_child(option_11, true);
      var option_11_value = {};
      template_effect(() => {
        set_text(text_86, get(resource).name);
        if (option_11_value !== (option_11_value = get(resource).id)) {
          option_11.value = (option_11.__value = option_11_value) ?? "";
        }
      });
      append($$anchor2, option_11);
    });
    var label_5 = sibling(label_4, 2);
    var text_87 = child(label_5);
    var label_6 = sibling(label_5, 2);
    var text_88 = child(label_6);
    var label_7 = sibling(label_6, 2);
    var text_89 = child(label_7);
    var button_22 = sibling(label_7, 2);
    var text_90 = sibling(child(button_22));
    bind_this(form, ($$value) => set(fixedBlockForm, $$value), () => get(fixedBlockForm));
    var div_26 = sibling(div_23, 2);
    var div_27 = child(div_26);
    var div_28 = sibling(child(div_27));
    var h3_1 = child(div_28);
    var text_91 = only_child(h3_1, true);
    var p_13 = sibling(h3_1);
    var text_92 = only_child(p_13, true);
    var form_1 = sibling(div_27, 2);
    var label_8 = child(form_1);
    var text_93 = child(label_8);
    var select_4 = sibling(text_93);
    var option_12 = child(select_4);
    var text_94 = only_child(option_12, true);
    option_12.value = option_12.__value = "";
    var node_22 = sibling(option_12);
    each(node_22, 1, () => get(facilities), (facility) => facility.id, ($$anchor2, facility) => {
      var option_13 = root_5();
      var text_95 = only_child(option_13, true);
      var option_13_value = {};
      template_effect(() => {
        set_text(text_95, get(facility).name);
        if (option_13_value !== (option_13_value = get(facility).id)) {
          option_13.value = (option_13.__value = option_13_value) ?? "";
        }
      });
      append($$anchor2, option_13);
    });
    init_select(select_4);
    var label_9 = sibling(label_8, 2);
    var text_96 = child(label_9);
    var select_5 = sibling(text_96);
    var option_14 = child(select_5);
    var text_97 = only_child(option_14, true);
    option_14.value = option_14.__value = "";
    var node_23 = sibling(option_14);
    each(node_23, 1, () => get(facilities).find((facility) => facility.id === get(recurringBlockFacility))?.resources || [], (resource) => resource.id, ($$anchor2, resource) => {
      var option_15 = root_5();
      var text_98 = only_child(option_15, true);
      var option_15_value = {};
      template_effect(() => {
        set_text(text_98, get(resource).name);
        if (option_15_value !== (option_15_value = get(resource).id)) {
          option_15.value = (option_15.__value = option_15_value) ?? "";
        }
      });
      append($$anchor2, option_15);
    });
    var label_10 = sibling(label_9, 2);
    var text_99 = child(label_10);
    var select_6 = sibling(text_99);
    each(select_6, 4, () => [0, 1, 2, 3, 4, 5, 6], index, ($$anchor2, index2) => {
      var option_16 = root_5();
      var text_100 = only_child(option_16, true);
      var option_16_value = {};
      template_effect(
        ($0) => {
          set_text(text_100, $0);
          if (option_16_value !== (option_16_value = index2 + 1)) {
            option_16.value = option_16.__value = option_16_value;
          }
        },
        [() => weekday(index2)]
      );
      append($$anchor2, option_16);
    });
    var label_11 = sibling(label_10, 2);
    var text_101 = child(label_11);
    var label_12 = sibling(label_11, 2);
    var text_102 = child(label_12);
    var label_13 = sibling(label_12, 2);
    var text_103 = child(label_13);
    var button_23 = sibling(label_13, 2);
    var text_104 = sibling(child(button_23));
    bind_this(form_1, ($$value) => set(recurringBlockForm, $$value), () => get(recurringBlockForm));
    var div_29 = sibling(div_26, 2);
    var div_30 = child(div_29);
    var div_31 = child(div_30);
    var h3_2 = child(div_31);
    var text_105 = only_child(h3_2, true);
    var p_14 = sibling(h3_2);
    var text_106 = only_child(p_14, true);
    var div_32 = sibling(div_30, 2);
    var div_33 = child(div_32);
    var table_2 = child(div_33);
    var thead_2 = child(table_2);
    var tr_9 = child(thead_2);
    var th_12 = child(tr_9);
    var text_107 = only_child(th_12, true);
    var th_13 = sibling(th_12);
    var text_108 = only_child(th_13, true);
    var th_14 = sibling(th_13);
    var text_109 = only_child(th_14, true);
    var th_15 = sibling(th_14);
    var text_110 = only_child(th_15, true);
    var th_16 = sibling(th_15);
    var text_111 = only_child(th_16, true);
    var th_17 = sibling(th_16);
    var text_112 = only_child(th_17, true);
    var tbody_2 = sibling(thead_2);
    var node_24 = child(tbody_2);
    {
      var consequent_18 = ($$anchor2) => {
        var tr_10 = root_21();
        var td_16 = child(tr_10);
        var text_113 = only_child(td_16, true);
        template_effect(($0) => set_text(text_113, $0), [() => tr("LOADING_BLOCKS")]);
        append($$anchor2, tr_10);
      };
      var consequent_19 = ($$anchor2) => {
        var tr_11 = root_21();
        var td_17 = child(tr_11);
        var text_114 = only_child(td_17, true);
        template_effect(($0) => set_text(text_114, $0), [() => tr("NO_BLOCKS_CONFIGURED")]);
        append($$anchor2, tr_11);
      };
      var alternate_3 = ($$anchor2) => {
        var fragment_5 = root_23();
        var node_25 = first_child(fragment_5);
        each(node_25, 1, () => get(blocks), (block2) => block2.id, ($$anchor3, block2) => {
          var tr_12 = root_22();
          var td_18 = child(tr_12);
          var span_9 = child(td_18);
          var text_115 = only_child(span_9, true);
          var td_19 = sibling(td_18);
          var text_116 = only_child(td_19, true);
          var td_20 = sibling(td_19);
          var text_117 = only_child(td_20, true);
          var td_21 = sibling(td_20);
          var text_118 = only_child(td_21, true);
          var td_22 = sibling(td_21);
          var text_119 = only_child(td_22);
          var td_23 = sibling(td_22);
          var button_24 = child(td_23);
          var text_120 = only_child(button_24, true);
          template_effect(
            ($0, $1, $2, $3, $4, $5) => {
              set_text(text_115, $0);
              set_text(text_116, $1);
              set_text(text_117, $2);
              set_text(text_118, get(block2).title);
              set_text(text_119, `${$3 ?? ""} – ${$4 ?? ""}`);
              set_text(text_120, $5);
            },
            [
              () => tr("ONE_TIME"),
              () => facilityName(get(block2).facility_id),
              () => resourceName(get(block2).facility_id, get(block2).resource_id),
              () => format(get(block2).start, get(facilities).find((facility) => facility.id === get(block2).facility_id)?.timezone),
              () => format(get(block2).end, get(facilities).find((facility) => facility.id === get(block2).facility_id)?.timezone),
              () => tr("REMOVE")
            ]
          );
          delegated("click", button_24, () => void deleteBlock("fixed", get(block2).id));
          append($$anchor3, tr_12);
        });
        var node_26 = sibling(node_25, 2);
        each(node_26, 1, () => get(recurring), (block2) => block2.id, ($$anchor3, block2) => {
          var tr_13 = root_22();
          var td_24 = child(tr_13);
          var span_10 = child(td_24);
          var text_121 = only_child(span_10, true);
          var td_25 = sibling(td_24);
          var text_122 = only_child(td_25, true);
          var td_26 = sibling(td_25);
          var text_123 = only_child(td_26, true);
          var td_27 = sibling(td_26);
          var text_124 = only_child(td_27, true);
          var td_28 = sibling(td_27);
          var text_125 = only_child(td_28);
          var td_29 = sibling(td_28);
          var button_25 = child(td_29);
          var text_126 = only_child(button_25, true);
          template_effect(
            ($0, $1, $2, $3, $4) => {
              set_text(text_121, $0);
              set_text(text_122, $1);
              set_text(text_123, $2);
              set_text(text_124, get(block2).title);
              set_text(text_125, `${$3 ?? ""} ${get(block2).start_time ?? ""}–${get(block2).end_time ?? ""}`);
              set_text(text_126, $4);
            },
            [
              () => tr("WEEKLY"),
              () => facilityName(get(block2).facility_id),
              () => resourceName(get(block2).facility_id, get(block2).resource_id),
              () => weekday(Number(get(block2).weekday) - 1, true),
              () => tr("REMOVE")
            ]
          );
          delegated("click", button_25, () => void deleteBlock("recurring", get(block2).id));
          append($$anchor3, tr_13);
        });
        append($$anchor2, fragment_5);
      };
      if_block(node_24, ($$render) => {
        if (get(isLoadingBlocks)) $$render(consequent_18);
        else if (get(blocks).length === 0 && get(recurring).length === 0) $$render(consequent_19, 1);
        else $$render(alternate_3, -1);
      });
    }
    var node_27 = sibling(div_20, 2);
    BookingDialog(node_27, {
      get booking() {
        return get(activeBooking);
      },
      get facilities() {
        return get(facilities);
      },
      get locale() {
        return get(adminLocale);
      },
      onSave: saveBooking,
      onClose: () => set(bookingDialogOpen, false),
      get open() {
        return get(bookingDialogOpen);
      },
      set open($$value) {
        set(bookingDialogOpen, $$value);
      },
      $$legacy: true
    });
    var dialog = sibling(node_27, 2);
    var node_28 = child(dialog);
    {
      var consequent_24 = ($$anchor2) => {
        var fragment_6 = root_29();
        var div_34 = first_child(fragment_6);
        var div_35 = child(div_34);
        var p_15 = child(div_35);
        var text_127 = only_child(p_15, true);
        var h2_3 = sibling(p_15);
        var text_128 = only_child(h2_3, true);
        var button_26 = sibling(div_35, 2);
        var dl = sibling(div_34, 2);
        var dt = child(dl);
        var text_129 = only_child(dt, true);
        var dd = sibling(dt);
        var text_130 = only_child(dd, true);
        var dt_1 = sibling(dd, 2);
        var text_131 = only_child(dt_1, true);
        var dd_1 = sibling(dt_1);
        var text_132 = only_child(dd_1);
        var dt_2 = sibling(dd_1, 2);
        var text_133 = only_child(dt_2, true);
        var dd_2 = sibling(dt_2);
        var text_134 = only_child(dd_2);
        var dt_3 = sibling(dd_2, 2);
        var text_135 = only_child(dt_3, true);
        var dd_3 = sibling(dt_3);
        var span_11 = child(dd_3);
        var text_136 = only_child(span_11, true);
        var dt_4 = sibling(dd_3, 2);
        var text_137 = only_child(dt_4, true);
        var dd_4 = sibling(dt_4);
        var text_138 = only_child(dd_4, true);
        var dt_5 = sibling(dd_4, 2);
        var text_139 = only_child(dt_5, true);
        var dd_5 = sibling(dt_5);
        var text_140 = only_child(dd_5, true);
        var h3_3 = sibling(dl, 2);
        var text_141 = only_child(h3_3, true);
        var node_29 = sibling(h3_3, 2);
        {
          var consequent_20 = ($$anchor3) => {
            var ul = root_25();
            each(ul, 5, () => get(details).events, index, ($$anchor4, item) => {
              var li = root_24();
              var time = child(li);
              var text_142 = only_child(time, true);
              var text_143 = sibling(time);
              template_effect(
                ($0, $1) => {
                  set_text(text_142, $0);
                  set_text(text_143, ` · ${$1 ?? ""}`);
                },
                [
                  () => format(get(item).happened_at),
                  () => translate(get(adminLocale), "PLUGIN_BOOKING.ADMIN.UI.EVENT_BY_ACTOR", {
                    action: eventLabel(get(item).action),
                    actor: get(item).actor
                  })
                ]
              );
              append($$anchor4, li);
            });
            append($$anchor3, ul);
          };
          var alternate_4 = ($$anchor3) => {
            var p_16 = root_26();
            var text_144 = only_child(p_16, true);
            template_effect(($0) => set_text(text_144, $0), [() => tr("NO_EVENTS_RECORDED")]);
            append($$anchor3, p_16);
          };
          if_block(node_29, ($$render) => {
            if (get(details).events.length) $$render(consequent_20);
            else $$render(alternate_4, -1);
          });
        }
        var h3_4 = sibling(node_29, 2);
        var text_145 = only_child(h3_4, true);
        var node_30 = sibling(h3_4, 2);
        {
          var consequent_22 = ($$anchor3) => {
            var ul_1 = root_25();
            each(ul_1, 5, () => get(details).notifications, index, ($$anchor4, item) => {
              var li_1 = root_27();
              var strong_5 = child(li_1);
              var text_146 = only_child(strong_5, true);
              var text_147 = sibling(strong_5);
              var node_31 = sibling(text_147);
              {
                var consequent_21 = ($$anchor5) => {
                  var text_148 = text();
                  template_effect(() => set_text(text_148, `— ${get(item).last_error ?? ""}`));
                  append($$anchor5, text_148);
                };
                if_block(node_31, ($$render) => {
                  if (get(item).last_error) $$render(consequent_21);
                });
              }
              template_effect(
                ($0, $1, $2, $3) => {
                  set_text(text_146, $0);
                  set_text(text_147, ` ${$1 ?? ""} ${$2 ?? ""}: ${$3 ?? ""}`);
                },
                [
                  () => eventLabel(get(item).event),
                  () => tr("TO"),
                  () => get(item).recipient || tr("REDACTED"),
                  () => notificationStatus(get(item).status)
                ]
              );
              append($$anchor4, li_1);
            });
            append($$anchor3, ul_1);
          };
          var alternate_5 = ($$anchor3) => {
            var p_17 = root_26();
            var text_149 = only_child(p_17, true);
            template_effect(($0) => set_text(text_149, $0), [() => tr("NO_EMAIL_NOTIFICATIONS_QUEUED")]);
            append($$anchor3, p_17);
          };
          if_block(node_30, ($$render) => {
            if (get(details).notifications.length) $$render(consequent_22);
            else $$render(alternate_5, -1);
          });
        }
        var div_36 = sibling(node_30, 2);
        var node_32 = child(div_36);
        {
          var consequent_23 = ($$anchor3) => {
            var button_27 = root_28();
            var text_150 = only_child(button_27, true);
            template_effect(($0) => set_text(text_150, $0), [() => tr("SEND_PAYMENT_INFORMATION")]);
            delegated("click", button_27, () => get(details) && void sendPaymentInformation(get(details).booking));
            append($$anchor3, button_27);
          };
          if_block(node_32, ($$render) => {
            if (get(details).booking.status !== "verification_pending") $$render(consequent_23);
          });
        }
        var button_28 = sibling(node_32, 2);
        var text_151 = only_child(button_28, true);
        template_effect(
          ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) => {
            set_text(text_127, $0);
            set_text(text_128, $1);
            set_attribute(button_26, "aria-label", $2);
            set_text(text_129, $3);
            set_text(text_130, get(details).booking.facility_name);
            set_text(text_131, $4);
            set_text(text_132, `${get(details).booking.customer_name ?? ""} · ${get(details).booking.customer_email ?? ""}`);
            set_text(text_133, $5);
            set_text(text_134, `${$6 ?? ""} – ${$7 ?? ""} (${get(details).booking.timezone ?? ""})`);
            set_text(text_135, $8);
            set_class(span_11, 1, `status-badge status-badge--${get(details).booking.status ?? ""}`);
            set_text(text_136, $9);
            set_text(text_137, $10);
            set_text(text_138, get(details).booking.customer_note || "—");
            set_text(text_139, $11);
            set_text(text_140, get(details).booking.admin_note || "—");
            set_text(text_141, $12);
            set_text(text_145, $13);
            set_text(text_151, $14);
          },
          [
            () => tr("BOOKING_RECORD"),
            () => tr("BOOKING_DETAILS"),
            () => tr("CLOSE"),
            () => tr("FACILITY"),
            () => tr("REQUESTER"),
            () => tr("TIME"),
            () => format(get(details).booking.start, get(details).booking.timezone),
            () => format(get(details).booking.end, get(details).booking.timezone),
            () => tr("STATUS"),
            () => statusLabel(get(details).booking.status),
            () => tr("REQUESTER_NOTE"),
            () => tr("ADMINISTRATOR_NOTE"),
            () => tr("HISTORY"),
            () => tr("EMAIL_DELIVERY"),
            () => tr("CLOSE")
          ]
        );
        delegated("click", button_26, () => get(detailDialog).close());
        delegated("click", button_28, () => get(detailDialog).close());
        append($$anchor2, fragment_6);
      };
      if_block(node_28, ($$render) => {
        if (get(details)) $$render(consequent_24);
      });
    }
    bind_this(dialog, ($$value) => set(detailDialog, $$value), () => get(detailDialog));
    template_effect(
      ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60) => {
        set_attribute(main, "lang", get(adminLocale));
        set_text(text$1, $0);
        set_attribute(div_2, "aria-label", $1);
        classes = set_class(button_2, 1, "booking-tab", null, classes, { active: get(activeTab) === "bookings" });
        set_attribute(button_2, "aria-selected", get(activeTab) === "bookings");
        set_attribute(button_2, "tabindex", get(activeTab) === "bookings" ? 0 : -1);
        set_text(text_8, $2);
        set_text(text_9, get(isLoadingBookings) ? "…" : get(totalBookings));
        classes_1 = set_class(button_3, 1, "booking-tab", null, classes_1, { active: get(activeTab) === "facilities" });
        set_attribute(button_3, "aria-selected", get(activeTab) === "facilities");
        set_attribute(button_3, "tabindex", get(activeTab) === "facilities" ? 0 : -1);
        set_text(text_10, $3);
        set_text(text_11, get(isLoadingFacilities) ? "…" : get(facilities).length);
        classes_2 = set_class(button_4, 1, "booking-tab", null, classes_2, { active: get(activeTab) === "blocks" });
        set_attribute(button_4, "aria-selected", get(activeTab) === "blocks");
        set_attribute(button_4, "tabindex", get(activeTab) === "blocks" ? 0 : -1);
        set_text(text_12, $4);
        set_attribute(div_3, "hidden", get(activeTab) !== "bookings");
        set_text(text_13, $5);
        set_text(text_14, $6);
        set_attribute(div_7, "aria-label", $7);
        classes_3 = set_class(button_5, 1, "btn btn-secondary", null, classes_3, { active: get(bookingView) === "table" });
        set_attribute(button_5, "aria-pressed", get(bookingView) === "table");
        set_text(text_15, ` ${$8 ?? ""}`);
        classes_4 = set_class(button_6, 1, "btn btn-secondary", null, classes_4, { active: get(bookingView) === "calendar" });
        set_attribute(button_6, "aria-pressed", get(bookingView) === "calendar");
        set_text(text_16, ` ${$9 ?? ""}`);
        set_text(text_17, ` ${$10 ?? ""}`);
        set_text(text_18, ` ${$11 ?? ""}`);
        set_text(text_19, `${$12 ?? ""} `);
        set_text(text_20, $13);
        set_text(text_22, `${$14 ?? ""} `);
        set_text(text_23, $15);
        set_text(text_24, $16);
        set_text(text_25, $17);
        set_text(text_26, $18);
        set_text(text_27, $19);
        set_text(text_28, $20);
        set_text(text_29, ` ${$21 ?? ""}`);
        set_attribute(div_13, "hidden", get(activeTab) !== "facilities");
        set_text(text_57, $22);
        set_text(text_58, $23);
        set_text(text_59, ` ${$24 ?? ""}`);
        set_text(text_60, $25);
        set_text(text_61, $26);
        set_text(text_62, $27);
        set_text(text_63, $28);
        set_text(text_64, $29);
        set_attribute(div_20, "hidden", get(activeTab) !== "blocks");
        set_text(text_77, $30);
        set_text(text_78, $31);
        set_text(text_79, $32);
        set_text(text_80, $33);
        set_text(text_81, $34);
        set_text(text_82, $35);
        set_text(text_84, $36);
        set_text(text_85, $37);
        set_text(text_87, $38);
        set_text(text_88, $39);
        set_text(text_89, $40);
        set_text(text_90, ` ${$41 ?? ""}`);
        set_text(text_91, $42);
        set_text(text_92, $43);
        set_text(text_93, $44);
        set_text(text_94, $45);
        set_text(text_96, $46);
        set_text(text_97, $47);
        set_text(text_99, $48);
        set_text(text_101, $49);
        set_text(text_102, $50);
        set_text(text_103, $51);
        set_text(text_104, ` ${$52 ?? ""}`);
        set_text(text_105, $53);
        set_text(text_106, $54);
        set_text(text_107, $55);
        set_text(text_108, $56);
        set_text(text_109, $57);
        set_text(text_110, $58);
        set_text(text_111, $59);
        set_text(text_112, $60);
      },
      [
        () => tr("HEADER_DESCRIPTION"),
        () => tr("BOOKING_ADMINISTRATION"),
        () => tr("BOOKINGS"),
        () => tr("FACILITIES"),
        () => tr("AVAILABILITY_BLOCKS"),
        () => tr("ALL_BOOKINGS"),
        () => tr("BOOKINGS_DESCRIPTION"),
        () => tr("BOOKING_VIEW"),
        () => tr("TABLE_VIEW"),
        () => tr("CALENDAR_VIEW"),
        () => tr("REFRESH"),
        () => tr("NEW_BOOKING"),
        () => tr("FACILITY"),
        () => tr("ALL_FACILITIES"),
        () => tr("STATUS"),
        () => tr("ALL_STATUSES"),
        () => statusLabel("verification_pending"),
        () => statusLabel("pending"),
        () => statusLabel("confirmed"),
        () => statusLabel("rejected"),
        () => statusLabel("cancelled"),
        () => tr("FILTER_HINT"),
        () => tr("FACILITIES"),
        () => tr("FACILITIES_DESCRIPTION"),
        () => tr("ADD_FACILITY"),
        () => tr("FACILITY"),
        () => tr("MODE"),
        () => tr("APPROVAL"),
        () => tr("AVAILABILITY"),
        () => tr("ACTIONS"),
        () => tr("AVAILABILITY_BLOCKS"),
        () => tr("BLOCKS_DESCRIPTION"),
        () => tr("BLOCK_DATE_TIME"),
        () => tr("BLOCK_DATE_TIME_DESCRIPTION"),
        () => tr("FACILITY"),
        () => tr("CHOOSE_FACILITY"),
        () => tr("ROOM"),
        () => tr("ALL_ROOMS"),
        () => tr("START"),
        () => tr("END"),
        () => tr("TITLE"),
        () => tr("ADD_BLOCK"),
        () => tr("RECURRING_UNAVAILABLE"),
        () => tr("RECURRING_UNAVAILABLE_DESCRIPTION"),
        () => tr("FACILITY"),
        () => tr("CHOOSE_FACILITY"),
        () => tr("ROOM"),
        () => tr("ALL_ROOMS"),
        () => tr("WEEKDAY"),
        () => tr("START"),
        () => tr("END"),
        () => tr("TITLE"),
        () => tr("ADD_RECURRING_BLOCK"),
        () => tr("CURRENT_BLOCKS"),
        () => tr("CURRENT_BLOCKS_DESCRIPTION"),
        () => tr("TYPE"),
        () => tr("FACILITY"),
        () => tr("ROOM"),
        () => tr("TITLE"),
        () => tr("WHEN"),
        () => tr("ACTIONS")
      ]
    );
    delegated("click", button_2, () => set(activeTab, "bookings"));
    delegated("keydown", button_2, handleTabKey);
    delegated("click", button_3, () => set(activeTab, "facilities"));
    delegated("keydown", button_3, handleTabKey);
    delegated("click", button_4, () => set(activeTab, "blocks"));
    delegated("keydown", button_4, handleTabKey);
    delegated("click", button_5, () => setBookingView("table"));
    delegated("click", button_6, () => setBookingView("calendar"));
    delegated("click", button_7, () => void loadBookings());
    delegated("click", button_8, () => openBooking());
    delegated("change", select, handleFilterChange);
    bind_select_value(select, () => get(facilityFilter), ($$value) => set(facilityFilter, $$value));
    delegated("change", select_1, handleFilterChange);
    bind_select_value(select_1, () => get(statusFilter), ($$value) => set(statusFilter, $$value));
    delegated("click", button_18, () => openFacility());
    event("submit", form, submitFixedBlock);
    bind_select_value(select_2, () => get(fixedBlockFacility), ($$value) => set(fixedBlockFacility, $$value));
    event("submit", form_1, submitRecurringBlock);
    bind_select_value(select_4, () => get(recurringBlockFacility), ($$value) => set(recurringBlockFacility, $$value));
    event("close", dialog, () => set(details, null));
    append($$anchor, main);
    pop();
  }
  delegate(["click", "keydown", "change"]);
  const bookingStyles = ".booking-admin {\n  --booking-bg: var(--background, #18181b);\n  --booking-panel: var(--card, #202025);\n  --booking-raised: var(--muted, #29292f);\n  --booking-fg: var(--foreground, #f4f4f5);\n  --booking-muted: var(--muted-foreground, #a1a1aa);\n  --booking-border: var(--border, #3a3a42);\n  --booking-primary: var(--primary, #a855f7);\n  --booking-primary-fg: var(--primary-foreground, #fff);\n  --booking-danger: var(--destructive, #dc2626);\n  width: 100%;\n  max-width: none;\n  margin: 0;\n  padding: .5rem clamp(1rem, 1.25vw, 1.5rem) 1rem;\n  color: var(--booking-fg);\n  font: inherit;\n}\n\n.booking-admin,\n.booking-admin * {\n  box-sizing: border-box;\n}\n\n.booking-admin [hidden] {\n  display: none !important;\n}\n\n.booking-admin p {\n  margin: 0;\n  color: var(--booking-muted);\n  line-height: 1.55;\n}\n\n.booking-page-description {\n  margin: 0 0 .85rem !important;\n  font-size: .86rem;\n}\n\n.booking-header {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  margin: 0 0 1.5rem;\n}\n\n.booking-header__identity {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  min-width: 0;\n}\n\n.booking-header__icon,\n.booking-card__icon {\n  display: grid;\n  flex: 0 0 3rem;\n  width: 3rem;\n  height: 3rem;\n  place-items: center;\n  border-radius: .9rem;\n  color: var(--booking-primary);\n  background: color-mix(in srgb, var(--booking-primary) 16%, transparent);\n  font-size: 1.2rem;\n}\n\n.booking-eyebrow {\n  margin: 0 0 .2rem !important;\n  color: var(--booking-primary) !important;\n  font-size: .7rem;\n  line-height: 1.2;\n  font-weight: 750;\n  letter-spacing: .12em;\n}\n\n.booking-header h1 {\n  margin: 0;\n  color: var(--booking-fg);\n  font-size: clamp(1.5rem, 2.2vw, 1.85rem);\n  line-height: 1.2;\n  font-weight: 700;\n  letter-spacing: -.025em;\n}\n\n.booking-header__description {\n  margin-top: .35rem !important;\n  font-size: .92rem;\n}\n\n.booking-alert {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  padding: .9rem 1rem;\n  margin: 0 0 1rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .7rem;\n  color: var(--booking-fg);\n  background: var(--booking-panel);\n  line-height: 1.5;\n}\n\n.booking-alert p {\n  margin: .28rem 0;\n  color: inherit;\n  font-size: .84rem;\n}\n\n.booking-alert--info {\n  border-color: color-mix(in srgb, #38bdf8 40%, var(--booking-border));\n  background: color-mix(in srgb, #0ea5e9 10%, var(--booking-panel));\n}\n\n.booking-alert--warning {\n  border-color: color-mix(in srgb, #f59e0b 45%, var(--booking-border));\n  background: color-mix(in srgb, #f59e0b 10%, var(--booking-panel));\n}\n\n.booking-alert--danger {\n  border-color: color-mix(in srgb, var(--booking-danger) 50%, var(--booking-border));\n  background: color-mix(in srgb, var(--booking-danger) 12%, var(--booking-panel));\n}\n\n.booking-alert--success {\n  border-color: color-mix(in srgb, #16a34a 45%, var(--booking-border));\n  background: color-mix(in srgb, #16a34a 10%, var(--booking-panel));\n}\n\n.booking-alert__note {\n  font-size: .76rem !important;\n}\n\n.booking-alert__close {\n  display: grid;\n  flex: 0 0 2rem;\n  width: 2rem;\n  height: 2rem;\n  place-items: center;\n  border: 0;\n  border-radius: .4rem;\n  color: inherit;\n  background: transparent;\n  font-size: 1.35rem;\n  cursor: pointer;\n}\n\n.booking-tabs {\n  display: flex;\n  gap: .35rem;\n  width: max-content;\n  max-width: 100%;\n  padding: .35rem;\n  margin: 0 0 1.35rem;\n  overflow-x: auto;\n  border: 1px solid var(--booking-border);\n  border-radius: .8rem;\n  background: var(--booking-panel);\n}\n\n.booking-tab {\n  display: inline-flex;\n  align-items: center;\n  gap: .6rem;\n  flex: 0 0 auto;\n  min-height: 2.6rem;\n  padding: .55rem .9rem;\n  border: 0;\n  border-radius: .55rem;\n  color: var(--booking-muted);\n  background: transparent;\n  font: inherit;\n  font-size: .88rem;\n  font-weight: 600;\n  white-space: nowrap;\n  cursor: pointer;\n  transition: background .15s ease, color .15s ease;\n}\n\n.booking-tab:hover {\n  color: var(--booking-fg);\n  background: var(--booking-raised);\n}\n\n.booking-tab.active {\n  color: var(--booking-primary-fg);\n  background: var(--booking-primary);\n}\n\n.booking-tab__count {\n  display: inline-grid;\n  min-width: 1.35rem;\n  height: 1.35rem;\n  place-items: center;\n  padding: 0 .35rem;\n  border-radius: 99px;\n  background: color-mix(in srgb, currentColor 15%, transparent);\n  font-size: .72rem;\n  font-weight: 700;\n}\n\n.booking-facility-tabs {\n  margin-bottom: .9rem;\n}\n\n.booking-facility-tabpanel {\n  min-width: 0;\n}\n\n.booking-facility-tabpanel:focus {\n  outline: 2px solid var(--booking-primary);\n  outline-offset: 3px;\n}\n\n.booking-admin button:focus-visible,\n.booking-admin a:focus-visible,\n.booking-admin input:focus-visible,\n.booking-admin select:focus-visible,\n.booking-admin textarea:focus-visible {\n  outline: 2px solid var(--booking-primary);\n  outline-offset: 2px;\n}\n\n.booking-panel {\n  min-width: 0;\n  animation: booking-enter .18s ease-out;\n}\n\n@keyframes booking-enter {\n  from { opacity: .55; transform: translateY(3px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n.booking-section-heading {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  margin: 0 0 1rem;\n}\n\n.booking-section-heading h2,\n.booking-card h3 {\n  margin: 0 0 .25rem;\n  color: var(--booking-fg);\n  font-size: 1.08rem;\n  line-height: 1.35;\n  font-weight: 650;\n}\n\n.booking-section-heading p,\n.booking-card__heading p {\n  font-size: .86rem;\n}\n\n.booking-actions,\n.booking-pagination {\n  display: flex;\n  flex-wrap: wrap;\n  gap: .55rem;\n}\n\n.booking-field {\n  display: grid;\n  gap: .4rem;\n  min-width: min(100%, 13rem);\n  color: var(--booking-fg);\n  font-size: .8rem;\n  font-weight: 600;\n}\n\n.booking-toolbar {\n  display: flex;\n  align-items: end;\n  flex-wrap: wrap;\n  gap: .8rem;\n  padding: 1rem;\n  margin: 0 0 .85rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .75rem;\n  background: var(--booking-panel);\n}\n\n.booking-toolbar__hint {\n  display: flex;\n  align-items: center;\n  gap: .4rem;\n  margin: 0 0 .55rem !important;\n  font-size: .78rem;\n}\n\n.booking-admin input,\n.booking-admin select,\n.booking-admin textarea {\n  min-width: 0;\n  max-width: 100%;\n  font: inherit;\n}\n\n.booking-admin .form-control,\n.booking-admin .form-select {\n  display: block;\n  width: 100%;\n  min-height: 2.55rem;\n  padding: .58rem .72rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .5rem;\n  outline: none;\n  color: var(--booking-fg);\n  background: var(--booking-bg);\n  font-size: .88rem;\n  transition: border-color .15s ease, box-shadow .15s ease;\n}\n\n.booking-admin textarea.form-control {\n  min-height: 5.5rem;\n  resize: vertical;\n}\n\n.booking-admin .form-control::placeholder {\n  color: var(--booking-muted);\n  opacity: .8;\n}\n\n.booking-admin .form-control:focus,\n.booking-admin .form-select:focus {\n  border-color: var(--booking-primary);\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--booking-primary) 24%, transparent);\n}\n\n.booking-admin select option {\n  color: var(--booking-fg);\n  background: var(--booking-bg);\n}\n\n.booking-admin .btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: .45rem;\n  min-height: 2.45rem;\n  padding: .55rem .82rem;\n  border: 1px solid transparent;\n  border-radius: .5rem;\n  color: var(--booking-fg);\n  background: transparent;\n  font: inherit;\n  font-size: .83rem;\n  line-height: 1.1;\n  font-weight: 650;\n  white-space: nowrap;\n  text-decoration: none;\n  cursor: pointer;\n  transition: background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease;\n}\n\n.booking-admin .btn:hover {\n  transform: translateY(-1px);\n}\n\n.booking-admin .btn:disabled {\n  opacity: .55;\n  transform: none;\n  cursor: not-allowed;\n}\n\n.booking-admin .btn-primary {\n  border-color: var(--booking-primary);\n  color: var(--booking-primary-fg);\n  background: var(--booking-primary);\n}\n\n.booking-admin .btn-primary:hover {\n  filter: brightness(1.08);\n}\n\n.booking-admin .btn-secondary {\n  border-color: var(--booking-border);\n  color: var(--booking-fg);\n  background: var(--booking-raised);\n}\n\n.booking-admin .btn-secondary:hover {\n  background: color-mix(in srgb, var(--booking-raised) 72%, var(--booking-fg));\n}\n\n.booking-admin .btn-success {\n  border-color: color-mix(in srgb, #16a34a 50%, var(--booking-border));\n  background: color-mix(in srgb, #16a34a 20%, var(--booking-panel));\n}\n\n.booking-admin .btn-warning {\n  border-color: color-mix(in srgb, #d97706 44%, var(--booking-border));\n  background: color-mix(in srgb, #d97706 18%, var(--booking-panel));\n}\n\n.booking-admin .btn-danger {\n  border-color: color-mix(in srgb, var(--booking-danger) 50%, var(--booking-border));\n  background: color-mix(in srgb, var(--booking-danger) 18%, var(--booking-panel));\n}\n\n.booking-admin .btn-link {\n  color: var(--booking-primary);\n}\n\n.booking-admin .btn-sm {\n  min-height: 2rem;\n  padding: .38rem .58rem;\n  font-size: .76rem;\n}\n\n.booking-admin .btn-icon {\n  width: 2.35rem;\n  min-width: 2.35rem;\n  padding: .35rem;\n  font-size: 1.3rem;\n}\n\n.booking-table-wrap {\n  overflow: hidden;\n  border: 1px solid var(--booking-border);\n  border-radius: .75rem;\n  background: var(--booking-panel);\n}\n\n.booking-table-scroll {\n  width: 100%;\n  overflow-x: auto;\n}\n\n.booking-table {\n  width: 100%;\n  border-collapse: collapse;\n  border-spacing: 0;\n  color: var(--booking-fg);\n  text-align: start;\n  font-size: .84rem;\n}\n\n.booking-table th {\n  padding: .82rem .9rem;\n  border-bottom: 1px solid var(--booking-border);\n  color: var(--booking-muted);\n  background: color-mix(in srgb, var(--booking-raised) 64%, var(--booking-panel));\n  font-size: .7rem;\n  font-weight: 750;\n  letter-spacing: .055em;\n  text-align: start;\n  text-transform: uppercase;\n  white-space: nowrap;\n}\n\n.booking-table td {\n  padding: .85rem .9rem;\n  border-bottom: 1px solid color-mix(in srgb, var(--booking-border) 78%, transparent);\n  vertical-align: middle;\n  line-height: 1.45;\n}\n\n.booking-table tbody tr:last-child td {\n  border-bottom: 0;\n}\n\n.booking-table tbody tr:not(:has(.table-message)):hover {\n  background: color-mix(in srgb, var(--booking-raised) 52%, transparent);\n}\n\n.booking-table td:first-child {\n  font-weight: 560;\n}\n\n.booking-table a {\n  color: var(--booking-primary);\n  text-decoration: none;\n  overflow-wrap: anywhere;\n}\n\n.booking-table a:hover {\n  text-decoration: underline;\n}\n\n.booking-table code {\n  display: inline-block;\n  margin-top: .18rem;\n  color: var(--booking-muted);\n  font-size: .74rem;\n  font-weight: 400;\n}\n\n.booking-table th:nth-child(3),\n.booking-table td:nth-child(3) {\n  min-width: 12rem;\n}\n\n.booking-table th:last-child,\n.booking-table td:last-child {\n  min-width: 14rem;\n}\n\n.booking-table .table-message {\n  padding: 2.25rem 1rem;\n  color: var(--booking-muted);\n  text-align: center;\n  font-size: .9rem;\n}\n\n.booking-table .table-message strong {\n  display: block;\n  margin-bottom: .25rem;\n  color: var(--booking-fg);\n  font-size: .97rem;\n}\n\n.booking-table .table-message p {\n  max-width: 32rem;\n  margin: .2rem auto .85rem;\n}\n\n.booking-row-actions {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: .3rem;\n  max-width: 28rem;\n}\n\n.status-badge {\n  display: inline-flex;\n  align-items: center;\n  padding: .32rem .58rem;\n  border-radius: 99px;\n  color: var(--booking-muted);\n  background: var(--booking-raised);\n  font-size: .72rem;\n  line-height: 1;\n  font-weight: 700;\n  text-transform: capitalize;\n  white-space: nowrap;\n}\n\n.status-badge--confirmed,\n.status-badge--automatic {\n  color: color-mix(in srgb, #16a34a 68%, var(--booking-fg));\n  background: color-mix(in srgb, #16a34a 19%, var(--booking-panel));\n}\n\n.status-badge--pending {\n  color: color-mix(in srgb, #d97706 68%, var(--booking-fg));\n  background: color-mix(in srgb, #d97706 19%, var(--booking-panel));\n}\n.status-badge--verification_pending {\n  background: rgba(59, 130, 246, .14);\n  color: #2563eb;\n}\n\n.status-badge--rejected,\n.status-badge--cancelled {\n  color: color-mix(in srgb, var(--booking-danger) 68%, var(--booking-fg));\n  background: color-mix(in srgb, var(--booking-danger) 19%, var(--booking-panel));\n}\n\n.status-badge--disabled {\n  color: var(--booking-muted);\n  background: var(--booking-raised);\n}\n\n.booking-table-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  min-height: 3.5rem;\n  color: var(--booking-muted);\n  font-size: .8rem;\n}\n\n.booking-view-switch {\n  display: inline-flex;\n  gap: .2rem;\n  padding: .2rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .65rem;\n  background: var(--booking-panel);\n}\n\n.booking-view-switch .btn {\n  min-height: 2.2rem;\n  padding: .45rem .7rem;\n}\n\n.booking-view-switch .btn.active {\n  border-color: var(--booking-primary);\n  color: var(--booking-primary-fg);\n  background: var(--booking-primary);\n}\n\n.booking-calendar {\n  padding: 1rem;\n  margin: 0 0 .5rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .8rem;\n  background: var(--booking-panel);\n}\n\n.booking-calendar__heading,\n.booking-calendar__month-nav,\n.booking-calendar__legend,\n.booking-calendar__legend-item {\n  display: flex;\n  align-items: center;\n}\n\n.booking-calendar__heading {\n  justify-content: space-between;\n  flex-wrap: wrap;\n  gap: .8rem 1.25rem;\n  margin-bottom: 1rem;\n}\n\n.booking-calendar__month-nav {\n  flex-wrap: wrap;\n  gap: .45rem;\n}\n\n.booking-calendar__month-nav h3 {\n  min-width: 10rem;\n  margin: 0 .35rem;\n  color: var(--booking-fg);\n  font-size: 1.1rem;\n  text-align: center;\n  text-transform: capitalize;\n}\n\n.booking-calendar__legend {\n  flex-wrap: wrap;\n  gap: .45rem .85rem;\n  color: var(--booking-muted);\n  font-size: .74rem;\n}\n\n.booking-calendar__legend-item {\n  gap: .35rem;\n  white-space: nowrap;\n}\n\n.booking-calendar__legend-dot {\n  width: .55rem;\n  height: .55rem;\n  border-radius: 50%;\n  background: var(--booking-muted);\n}\n\n.booking-calendar__legend-dot--confirmed { background: #22c55e; }\n.booking-calendar__legend-dot--pending { background: #f59e0b; }\n.booking-calendar__legend-dot--verification_pending { background: #3b82f6; }\n.booking-calendar__legend-dot--rejected,\n.booking-calendar__legend-dot--cancelled { background: var(--booking-danger); }\n\n.booking-calendar__loading {\n  padding: .65rem .8rem;\n  margin: 0 0 .75rem !important;\n  border: 1px solid var(--booking-border);\n  border-radius: .5rem;\n  background: var(--booking-bg);\n  font-size: .8rem;\n}\n\n.booking-calendar__month-bookings {\n  padding-bottom: .9rem;\n  margin-bottom: .9rem;\n  border-bottom: 1px solid var(--booking-border);\n}\n\n.booking-calendar__month-bookings-heading {\n  display: flex;\n  align-items: center;\n  gap: .5rem;\n  margin-bottom: .5rem;\n  color: var(--booking-fg);\n  font-size: .82rem;\n}\n\n.booking-calendar__month-bookings-heading span {\n  display: inline-grid;\n  min-width: 1.25rem;\n  height: 1.25rem;\n  place-items: center;\n  padding: 0 .3rem;\n  border-radius: 99px;\n  color: var(--booking-muted);\n  background: var(--booking-raised);\n  font-size: .68rem;\n}\n\n.booking-calendar__month-bookings-list {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));\n  gap: .4rem;\n  max-height: 8rem;\n  overflow-y: auto;\n}\n\n.booking-calendar__summary-event {\n  display: grid;\n  min-width: 0;\n  gap: .1rem;\n  padding: .45rem .55rem;\n  overflow: hidden;\n  border: 1px solid var(--booking-border);\n  border-left: 3px solid var(--booking-muted);\n  border-radius: .4rem;\n  color: var(--booking-fg);\n  background: var(--booking-bg);\n  font: inherit;\n  font-size: .73rem;\n  text-align: start;\n  cursor: pointer;\n}\n\n.booking-calendar__summary-event:hover {\n  background: var(--booking-raised);\n}\n\n.booking-calendar__summary-event > span:not(.booking-calendar__event-status) {\n  overflow: hidden;\n  color: var(--booking-muted);\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.booking-calendar__scroll {\n  width: 100%;\n  overflow-x: auto;\n}\n\n.booking-calendar__weekdays,\n.booking-calendar__grid {\n  display: grid;\n  grid-template-columns: repeat(7, minmax(8.5rem, 1fr));\n  min-width: 61rem;\n  gap: .4rem;\n}\n\n.booking-calendar__weekdays {\n  margin-bottom: .4rem;\n}\n\n.booking-calendar__weekdays span {\n  padding: .45rem .6rem;\n  color: var(--booking-muted);\n  font-size: .7rem;\n  font-weight: 750;\n  text-align: center;\n  text-transform: uppercase;\n}\n\n.booking-calendar__day {\n  min-width: 0;\n  min-height: 8.25rem;\n  padding: .5rem;\n  overflow: hidden;\n  border: 1px solid var(--booking-border);\n  border-radius: .55rem;\n  background: var(--booking-bg);\n}\n\n.booking-calendar__day--outside {\n  opacity: .55;\n}\n\n.booking-calendar__day--today {\n  border-color: var(--booking-primary);\n  box-shadow: inset 0 0 0 1px var(--booking-primary);\n}\n\n.booking-calendar__day-heading {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  min-height: 1.35rem;\n  margin-bottom: .3rem;\n  color: var(--booking-fg);\n  font-size: .78rem;\n  font-weight: 700;\n}\n\n.booking-calendar__day-count {\n  display: inline-grid;\n  min-width: 1.2rem;\n  height: 1.2rem;\n  place-items: center;\n  padding: 0 .25rem;\n  border-radius: 99px;\n  color: var(--booking-muted);\n  background: var(--booking-raised);\n  font-size: .65rem;\n}\n\n.booking-calendar__events {\n  display: grid;\n  gap: .3rem;\n  max-height: 6.25rem;\n  overflow-y: auto;\n}\n\n.booking-calendar__event {\n  display: grid;\n  width: 100%;\n  min-width: 0;\n  gap: .1rem;\n  padding: .35rem .4rem;\n  overflow: hidden;\n  border: 0;\n  border-left: 3px solid var(--booking-muted);\n  border-radius: .25rem;\n  color: var(--booking-fg);\n  background: var(--booking-raised);\n  font: inherit;\n  font-size: .67rem;\n  text-align: start;\n  cursor: pointer;\n}\n\n.booking-calendar__event:hover {\n  filter: brightness(1.12);\n}\n\n.booking-calendar__event--confirmed { border-left-color: #22c55e; }\n.booking-calendar__event--pending { border-left-color: #f59e0b; }\n.booking-calendar__event--verification_pending { border-left-color: #3b82f6; }\n.booking-calendar__event--rejected,\n.booking-calendar__event--cancelled { border-left-color: var(--booking-danger); }\n\n.booking-calendar__event-title,\n.booking-calendar__event-place {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.booking-calendar__event-title strong {\n  color: var(--booking-primary);\n  font-variant-numeric: tabular-nums;\n}\n\n.booking-calendar__event-place,\n.booking-calendar__event-status,\n.booking-calendar__empty-day {\n  color: var(--booking-muted);\n  font-size: .62rem;\n}\n\n.booking-calendar__event-status {\n  font-weight: 700;\n}\n\n.booking-calendar__empty-day {\n  display: block;\n  padding: .4rem .1rem;\n}\n\n.booking-card,\n.booking-editor {\n  padding: 1.15rem;\n  margin: 0 0 1rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .8rem;\n  background: var(--booking-panel);\n}\n\n.booking-card__heading {\n  display: flex;\n  align-items: center;\n  gap: .8rem;\n  margin-bottom: 1rem;\n}\n\n.booking-card__icon {\n  flex-basis: 2.5rem;\n  width: 2.5rem;\n  height: 2.5rem;\n  border-radius: .7rem;\n  background: color-mix(in srgb, var(--booking-primary) 14%, transparent);\n}\n\n.booking-card__heading h3 {\n  margin: 0 0 .18rem;\n}\n\n.booking-card__heading p {\n  font-size: .8rem;\n}\n\n.booking-block-list {\n  padding-bottom: .35rem;\n}\n\n.booking-block-list .booking-card__heading {\n  margin-bottom: .5rem;\n}\n\n.block-form {\n  display: grid;\n  grid-template-columns: repeat(12, minmax(0, 1fr));\n  align-items: end;\n  gap: .85rem;\n}\n\n.block-form > label {\n  display: grid;\n  grid-column: span 2;\n  align-content: start;\n  gap: .4rem;\n  min-width: 0;\n  color: var(--booking-fg);\n  font-size: .8rem;\n  font-weight: 600;\n}\n\n.block-form > .block-form__title {\n  grid-column: span 2;\n}\n\n.block-form > .btn {\n  grid-column: span 2;\n}\n\n.form-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));\n  gap: .85rem 1rem;\n}\n\n.form-grid > label:not(.form-check) {\n  display: grid;\n  align-content: start;\n  gap: .4rem;\n  color: var(--booking-fg);\n  font-size: .8rem;\n  font-weight: 600;\n}\n\n.form-grid small,\n.booking-facility-form fieldset small {\n  display: block;\n  margin-top: .1rem;\n  color: var(--booking-muted);\n  font-size: .76rem;\n  line-height: 1.5;\n  font-weight: 400;\n}\n\n.booking-resource-input {\n  font-family: ui-monospace, SFMono-Regular, Consolas, monospace !important;\n  font-size: .8rem !important;\n}\n\n.booking-editor {\n  margin-top: 1.2rem;\n  scroll-margin-top: 1.5rem;\n}\n\n.booking-editor__heading {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  padding-bottom: .8rem;\n  margin-bottom: 1rem;\n  border-bottom: 1px solid var(--booking-border);\n}\n\n.booking-editor__heading h3 {\n  margin: 0;\n  color: var(--booking-fg);\n  font-size: 1.15rem;\n}\n\n.booking-facility-form fieldset {\n  min-width: 0;\n  padding: 1rem;\n  margin: 1.1rem 0;\n  border: 1px solid var(--booking-border);\n  border-radius: .7rem;\n}\n\n.booking-facility-form legend {\n  padding: 0 .45rem;\n  color: var(--booking-fg);\n  font-size: .88rem;\n  font-weight: 700;\n}\n\n.booking-entry-mode {\n  display: flex;\n  flex-wrap: wrap;\n  gap: .45rem 1.1rem;\n  min-width: 0;\n  padding: .8rem 1rem;\n  margin: 0 0 1rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .7rem;\n}\n\n.booking-entry-mode legend {\n  padding: 0 .4rem;\n  color: var(--booking-fg);\n  font-size: .84rem;\n  font-weight: 700;\n}\n\n.booking-entry-mode .form-check {\n  margin: 0;\n}\n\n.booking-simple-help {\n  align-self: center;\n  margin: 0;\n  color: var(--booking-muted);\n  font-size: .78rem;\n}\n\n.booking-simple-slots {\n  display: grid;\n  gap: .65rem;\n  margin-top: 1rem;\n}\n\n.booking-simple-slots__heading {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-wrap: wrap;\n  gap: .7rem;\n}\n\n.booking-simple-slots__heading > div {\n  display: grid;\n  gap: .2rem;\n}\n\n.booking-simple-slots__heading small {\n  color: var(--booking-muted);\n  font-size: .76rem;\n  font-weight: 400;\n}\n\n.booking-simple-slot {\n  display: grid;\n  grid-template-columns: minmax(9rem, 1.4fr) repeat(2, minmax(7rem, .8fr)) auto;\n  align-items: end;\n  gap: .75rem;\n  padding: .8rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .6rem;\n  background: var(--booking-bg);\n}\n\n.booking-simple-slot > label {\n  display: grid;\n  gap: .35rem;\n  min-width: 0;\n  color: var(--booking-fg);\n  font-size: .78rem;\n  font-weight: 600;\n}\n\n.booking-facility-form fieldset > label:not(.form-check) {\n  display: grid;\n  gap: .42rem;\n  color: var(--booking-fg);\n  font-size: .8rem;\n  font-weight: 600;\n}\n\n.booking-admin .form-check {\n  display: flex;\n  align-items: center;\n  gap: .55rem;\n  color: var(--booking-fg);\n  font-size: .8rem;\n  font-weight: 600;\n}\n\n.booking-admin .form-check-input {\n  flex: 0 0 1rem;\n  width: 1rem;\n  height: 1rem;\n  accent-color: var(--booking-primary);\n}\n\n.booking-admin .form-check-inline {\n  display: inline-flex;\n  align-items: center;\n  gap: .4rem;\n  margin: .2rem .8rem .2rem 0;\n  color: var(--booking-fg);\n  font-size: .78rem;\n  font-weight: 500;\n  vertical-align: middle;\n}\n\n.booking-fieldset-toggle {\n  margin-bottom: .9rem;\n}\n\n.booking-recipient-field {\n  display: grid;\n  gap: .4rem;\n  max-width: 46rem;\n  margin: .8rem 0;\n  color: var(--booking-fg);\n  font-size: .8rem;\n  font-weight: 600;\n}\n\n.booking-recipient-field small {\n  color: var(--booking-muted);\n  font-size: .76rem;\n  font-weight: 400;\n}\n\n.booking-notification-card {\n  padding: 1.15rem 1.25rem 1.25rem !important;\n  margin: 0 !important;\n  background: var(--booking-panel);\n}\n\n.booking-notification-card > legend {\n  font-size: .98rem;\n}\n\n.booking-notification-language-note,\n.booking-email-format-note {\n  padding: .7rem .85rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .55rem;\n  background: var(--booking-bg);\n  font-size: .78rem;\n}\n\n.booking-notification-controls {\n  display: grid;\n  grid-template-columns: minmax(15rem, .85fr) minmax(18rem, 1.4fr);\n  align-items: start;\n  gap: .5rem 1.25rem;\n  margin-top: .9rem;\n}\n\n.booking-notification-controls .booking-fieldset-toggle {\n  margin: .55rem 0 0;\n}\n\n.booking-notification-controls .booking-recipient-field {\n  max-width: none;\n  margin: 0;\n}\n\n.booking-event-groups {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: .8rem;\n  margin-top: 1.1rem;\n  color: var(--booking-fg);\n  font-size: .8rem;\n}\n\n.booking-event-group {\n  min-width: 0;\n  padding: .9rem 1rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .65rem;\n  background: var(--booking-bg);\n}\n\n.booking-event-group h4 {\n  margin: 0 0 .35rem;\n  color: var(--booking-fg);\n  font-size: .84rem;\n  font-weight: 700;\n}\n\n.booking-event-group p {\n  font-size: .76rem;\n}\n\n.booking-email-templates {\n  padding-top: 1rem;\n  margin-top: 1.2rem;\n  border-top: 1px solid var(--booking-border);\n}\n\n.booking-email-templates > summary {\n  color: var(--booking-primary);\n  font-size: .9rem;\n  font-weight: 700;\n  cursor: pointer;\n}\n\n.booking-email-templates__content {\n  display: grid;\n  gap: .9rem;\n  margin-top: .9rem;\n}\n\n.booking-email-format-note {\n  color: var(--booking-muted);\n}\n\n.booking-email-help,\n.booking-email-layout {\n  padding: .8rem .9rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .6rem;\n  background: var(--booking-bg);\n}\n\n.booking-email-help > summary,\n.booking-email-layout > summary {\n  color: var(--booking-fg);\n  font-size: .8rem;\n  font-weight: 700;\n  cursor: pointer;\n}\n\n.booking-email-help[open] > summary,\n.booking-email-layout[open] > summary {\n  margin-bottom: .75rem;\n}\n\n.booking-email-placeholders {\n  display: flex;\n  flex-wrap: wrap;\n  gap: .4rem;\n}\n\n.booking-email-placeholders code {\n  padding: .25rem .4rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .35rem;\n  color: var(--booking-fg);\n  background: var(--booking-panel);\n  font-size: .72rem;\n}\n\n.booking-email-layout > p {\n  margin-bottom: .7rem;\n  font-size: .78rem;\n}\n\n.booking-email-template-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 25rem), 1fr));\n  gap: .9rem;\n}\n\n.booking-email-template-card {\n  display: grid;\n  align-content: start;\n  gap: .8rem;\n  min-width: 0;\n  padding: 1rem;\n  border: 1px solid var(--booking-border);\n  border-radius: .7rem;\n  background: var(--booking-panel);\n}\n\n.booking-email-template-card h5,\n.booking-email-messages-heading {\n  margin: 0;\n  color: var(--booking-fg);\n  font-size: .86rem;\n  line-height: 1.35;\n  font-weight: 700;\n}\n\n.booking-email-messages-heading {\n  margin-top: .25rem;\n  font-size: .95rem;\n}\n\n.booking-email-field {\n  display: grid;\n  gap: .4rem;\n  min-width: 0;\n  color: var(--booking-fg);\n  font-size: .76rem;\n  line-height: 1.4;\n  font-weight: 650;\n}\n\n.booking-admin textarea.booking-email-html {\n  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;\n  font-size: .76rem;\n  line-height: 1.5;\n}\n\n.booking-check-list {\n  margin-top: .35rem;\n}\n\n.booking-editor__actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: .55rem;\n  padding-top: .25rem;\n}\n\n.booking-dialog {\n  position: fixed;\n  inset: 0;\n  margin: auto;\n  width: min(900px, calc(100vw - 2rem));\n  max-width: none;\n  max-height: min(90vh, 58rem);\n  overflow: auto;\n  padding: 1.3rem;\n  border: 1px solid var(--booking-border);\n  border-radius: 1rem;\n  color: var(--booking-fg);\n  background: var(--booking-panel);\n  box-shadow: 0 1.5rem 4rem #0008;\n}\n\n.booking-dialog::backdrop {\n  background: #0009;\n  backdrop-filter: blur(2px);\n}\n\n.booking-dialog__heading {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  padding-bottom: 1rem;\n  margin-bottom: 1.1rem;\n  border-bottom: 1px solid var(--booking-border);\n}\n\n.booking-dialog__heading h2 {\n  margin: 0;\n  color: var(--booking-fg);\n  font-size: 1.25rem;\n}\n\n.booking-dialog__actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: .55rem;\n  padding-top: 1rem;\n  margin-top: 1rem;\n  border-top: 1px solid var(--booking-border);\n}\n\n.booking-form-grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: .85rem 1rem;\n}\n\n.booking-form-grid > label {\n  display: grid;\n  align-content: start;\n  gap: .4rem;\n  color: var(--booking-fg);\n  font-size: .8rem;\n  font-weight: 600;\n}\n\n.booking-form-grid__wide {\n  grid-column: span 2;\n}\n\n.booking-detail-dialog > h3 {\n  margin: 1.25rem 0 .5rem;\n  color: var(--booking-fg);\n  font-size: .95rem;\n}\n\n.booking-detail-grid {\n  display: grid;\n  grid-template-columns: minmax(7rem, .28fr) minmax(0, 1fr);\n  gap: .65rem 1rem;\n  padding: 1rem;\n  margin: 1rem 0;\n  border: 1px solid var(--booking-border);\n  border-radius: .7rem;\n  background: var(--booking-bg);\n}\n\n.booking-detail-grid dt {\n  color: var(--booking-muted);\n  font-size: .78rem;\n  font-weight: 600;\n}\n\n.booking-detail-grid dd {\n  min-width: 0;\n  margin: 0;\n  color: var(--booking-fg);\n  font-size: .86rem;\n  overflow-wrap: anywhere;\n}\n\n.booking-detail-list {\n  display: grid;\n  gap: .45rem;\n  padding-inline-start: 1.2rem;\n  color: var(--booking-muted);\n  font-size: .82rem;\n}\n\n.booking-detail-list time {\n  color: var(--booking-fg);\n}\n\n.booking-detail-empty {\n  font-size: .84rem;\n}\n\n.capitalize {\n  text-transform: capitalize;\n}\n\n.availability-window {\n  display: block;\n  white-space: nowrap;\n}\n\n@media (max-width: 1050px) {\n  .block-form > label,\n  .block-form > .block-form__title,\n  .block-form > .btn {\n    grid-column: span 4;\n  }\n}\n\n@media (max-width: 760px) {\n  .booking-admin {\n    padding: 1rem;\n  }\n\n  .booking-section-heading {\n    align-items: flex-start;\n    flex-direction: column;\n  }\n\n  .booking-section-heading > .btn,\n  .booking-actions {\n    width: 100%;\n  }\n\n  .booking-view-switch {\n    width: 100%;\n  }\n\n  .booking-view-switch .btn {\n    flex: 1;\n  }\n\n  .booking-simple-slot {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n\n  .booking-actions .btn {\n    flex: 1;\n  }\n\n  .block-form > label,\n  .block-form > .block-form__title,\n  .block-form > .btn {\n    grid-column: span 6;\n  }\n\n  .booking-table-footer {\n    align-items: flex-start;\n    flex-direction: column;\n    padding: .75rem 0;\n  }\n}\n\n@media (max-width: 560px) {\n  .booking-header__identity {\n    align-items: flex-start;\n    gap: .7rem;\n  }\n\n  .booking-header__icon {\n    flex-basis: 2.5rem;\n    width: 2.5rem;\n    height: 2.5rem;\n  }\n\n  .booking-tabs {\n    width: 100%;\n  }\n\n  .booking-tab {\n    flex: 1 0 auto;\n    justify-content: center;\n    padding: .5rem .65rem;\n    font-size: .8rem;\n  }\n\n  .booking-tab i {\n    display: none;\n  }\n\n  .block-form > label,\n  .block-form > .block-form__title,\n  .block-form > .btn {\n    grid-column: span 12;\n  }\n\n  .booking-form-grid {\n    grid-template-columns: 1fr;\n  }\n\n  .booking-form-grid__wide {\n    grid-column: span 1;\n  }\n\n  .booking-simple-slot {\n    grid-template-columns: 1fr;\n  }\n\n  .booking-simple-slot > .btn {\n    width: 100%;\n  }\n\n  .booking-event-groups {\n    grid-template-columns: 1fr;\n  }\n\n  .booking-notification-controls {\n    grid-template-columns: 1fr;\n  }\n\n  .booking-detail-grid {\n    grid-template-columns: 1fr;\n    gap: .3rem;\n  }\n\n  .booking-detail-grid dd {\n    margin-bottom: .45rem;\n  }\n\n  .booking-alert {\n    align-items: flex-start;\n    flex-direction: column;\n  }\n\n  .booking-card,\n  .booking-editor {\n    padding: .85rem;\n  }\n\n  .booking-dialog {\n    padding: 1rem;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .booking-admin *,\n  .booking-admin *::before,\n  .booking-admin *::after {\n    scroll-behavior: auto !important;\n    animation-duration: .01ms !important;\n    transition-duration: .01ms !important;\n  }\n}\n";
  const styleId = "grav-booking-admin-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = bookingStyles;
    document.head.append(style);
  }
  const tagName = window.__GRAV_PAGE_TAG || "grav-booking-admin-page";
  if (!customElements.get(tagName)) {
    class BookingAdminPage extends HTMLElement {
      app;
      connectedCallback() {
        if (this.app) return;
        this.style.display = "block";
        this.app = mount(BookingAdmin, { target: this });
      }
      disconnectedCallback() {
        if (!this.app) return;
        unmount(this.app);
        this.app = void 0;
      }
    }
    customElements.define(tagName, BookingAdminPage);
  }
})();
