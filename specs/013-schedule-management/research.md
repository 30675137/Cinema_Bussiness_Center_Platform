# Research Findings: 排期管理甘特图视图

**Feature**: 013-schedule-management  
**Date**: 2025-01-27  
**Status**: Complete

## Research Questions

### Q1: Gantt Chart Implementation Approach

**Question**: Which approach balances performance, maintainability, and customization needs?

**Decision**: Custom React component with CSS Grid/Flexbox

**Rationale**:
1. **Full Control**: Custom implementation provides complete control over rendering, interactions, and styling
2. **Performance**: CSS Grid provides efficient layout calculation, no external library overhead
3. **Maintainability**: Aligns with project's component-based architecture, easier to debug and extend
4. **Bundle Size**: No additional dependencies, keeps bundle size minimal
5. **Customization**: Easy to adapt to specific business requirements (event types, colors, interactions)

**Alternatives Considered**:
- **dhtmlx-gantt**: Feature-rich but heavy (500KB+), complex API, overkill for our use case
- **react-gantt-chart**: Lightweight but limited customization, may not support our specific event types
- **FullCalendar**: Calendar-focused, not optimized for gantt-style resource scheduling

**Implementation Notes**:
- Use CSS Grid for time axis layout (grid-template-columns based on time slots)
- Use absolute positioning for event blocks (calculated from start time and duration)
- Implement virtual scrolling only if performance issues arise (unlikely for 14-hour range)

---

### Q2: Time Axis Rendering Strategy

**Question**: Is virtual scrolling needed for 14-hour range, or is full rendering acceptable?

**Decision**: Full rendering with CSS positioning

**Rationale**:
1. **Scale**: 14-hour range = 14 time slots (hourly) or 28 slots (30-min intervals) - manageable size
2. **Performance**: Modern browsers handle 20-30 DOM elements efficiently
3. **Simplicity**: Full rendering simplifies event positioning calculations
4. **User Experience**: No scroll lag, smooth interactions, immediate visual feedback

**Alternatives Considered**:
- **Virtual Scrolling**: Would add complexity (viewport calculation, scroll position sync) without clear benefit for 14-hour range
- **Canvas Rendering**: Better performance for 1000+ events, but loses DOM interactivity (click, hover, tooltips)

**Implementation Notes**:
- Render all time slots upfront
- Use CSS Grid with `grid-template-columns: repeat(14, 1fr)` for hourly view
- Consider 30-minute intervals if needed (28 columns)
- Monitor performance with 20+ halls and 100+ events

---

### Q3: Event Block Positioning Method

**Question**: Which approach provides better performance and maintainability?

**Decision**: Absolute positioning with calculated left/width percentages (from demo)

**Rationale**:
1. **Proven Pattern**: Demo uses this approach successfully
2. **Precision**: Percentage-based positioning handles fractional hours (e.g., 10.5 = 10:30) accurately
3. **Performance**: Single calculation per event, no layout recalculation
4. **Flexibility**: Easy to adjust for different time ranges or intervals
5. **Overlap Handling**: Absolute positioning allows overlapping events (if needed for future features)

**Alternatives Considered**:
- **CSS Grid with grid-column**: More semantic but requires converting time to grid column numbers, less flexible for fractional hours
- **Flexbox**: Not suitable for time-based positioning

**Implementation Notes**:
- Calculate left position: `((startHour - startHour) / totalHours) * 100%`
- Calculate width: `(duration / totalHours) * 100%`
- Use `position: absolute` with `left` and `width` styles
- Ensure parent container has `position: relative`

---

### Q4: Conflict Detection Strategy

**Question**: Should conflict detection be client-side, server-side, or both?

**Decision**: Both client-side (immediate feedback) and server-side (authoritative validation)

**Rationale**:
1. **User Experience**: Client-side validation provides immediate feedback, prevents invalid submissions
2. **Data Integrity**: Server-side validation ensures consistency, handles concurrent updates
3. **Best Practice**: Defense in depth - validate at both layers
4. **Performance**: Client-side check is fast, reduces unnecessary API calls

**Alternatives Considered**:
- **Client-side only**: Faster UX but vulnerable to race conditions and concurrent edits
- **Server-side only**: Secure but poor UX (user must submit to see errors)

**Implementation Notes**:
- Client-side: Check for overlapping events in same hall before form submission
- Server-side: Re-validate on API call, return conflict errors if detected
- Display clear error messages: "该时间段已被占用，请选择其他时间"
- Consider optimistic updates with rollback on conflict

---

## Additional Research Findings

### Performance Optimization Strategies

1. **Event Block Rendering**:
   - Use `React.memo` for EventBlock component to prevent unnecessary re-renders
   - Implement `useMemo` for time calculations (left, width styles)
   - Use `useCallback` for event handlers

2. **Scroll Performance**:
   - Use CSS `will-change: transform` for smooth scrolling
   - Implement sticky positioning for hall cards (left column)
   - Consider `IntersectionObserver` for lazy loading if needed

3. **State Management**:
   - Use TanStack Query for server state (schedules, halls)
   - Use Zustand for UI state (selected date, viewport position, filters)
   - Implement optimistic updates for better perceived performance

### Accessibility Considerations

1. **Keyboard Navigation**:
   - Support arrow keys for date navigation
   - Tab navigation for event blocks
   - Enter/Space to open event details

2. **Screen Reader Support**:
   - ARIA labels for time slots and event blocks
   - Announce date changes and event details
   - Semantic HTML structure

3. **Color Contrast**:
   - Ensure event type colors meet WCAG AA standards
   - Provide alternative indicators (icons, patterns) for color-blind users

### Browser Compatibility

- **CSS Grid**: Supported in all modern browsers (Chrome 57+, Firefox 52+, Safari 10.1+, Edge 16+)
- **Absolute Positioning**: Universal support
- **Day.js**: Compatible with all browsers (IE11+ with polyfills)

### Testing Strategy

1. **Unit Tests**:
   - Time calculation utilities (left, width percentages)
   - Conflict detection logic
   - Date navigation functions

2. **Integration Tests**:
   - Event creation/editing flow
   - Date switching with data loading
   - Conflict detection and error handling

3. **E2E Tests**:
   - Complete schedule creation workflow
   - Multi-hall event management
   - Date navigation and persistence

---

## Conclusion

All research questions have been resolved. The implementation will use:
- Custom React component with CSS Grid/Flexbox for gantt chart
- Full rendering for 14-hour time axis
- Absolute positioning for event blocks
- Client-side + server-side conflict detection

This approach balances performance, maintainability, and user experience while staying aligned with project architecture and constraints.

