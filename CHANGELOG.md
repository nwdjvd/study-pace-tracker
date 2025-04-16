# Changelog

All notable changes to the Study Pace Tracker project will be documented in this file.

## [1.8.0] - 2023-04-08

### Added
- Today's Goal tracker showing progress toward daily goal (x/y format)
- Visual indicators with colors and icons to show if daily goal is met
- Celebration alert when reaching daily goal
- Smart pre-filling of task input field based on remaining tasks needed
- Improved labeling on the task update form for better clarity

## [1.7.0] - 2023-04-08

### Added
- Dark mode feature with a toggle switch for improved eye comfort
- Persistent dark mode preference saved with localStorage
- Complete UI redesign with dark color scheme when dark mode is activated
- Smooth transitions between light and dark themes
- Theme toggle with sun/moon icons for intuitive switching

## [1.6.0] - 2023-04-08

### Changed
- Completely removed the graph feature to resolve initialization and data loading issues
- Reverted to the version before graph implementation to ensure data persistence stability
- Simplified the application to focus on core tracking functionality

## [1.5.1] - 2023-04-08

### Fixed
- Fixed critical bug where saved data was not properly loaded on application start
- Improved initialization process to properly handle saved state
- Added better error handling for setup form submission
- Added validation to prevent setup with invalid data
- Fixed issue where users were redirected to setup screen despite having saved data

## [1.5.0] - 2023-04-08

### Changed
- Completely redesigned the progress graph as a horizontal bar chart (staple diagram)
- New graph shows percentage of total tasks completed instead of time-based progress
- Added a clear horizontal 100% target line in green
- Simplified visualization focusing only on completion percentage
- Reduced graph height for better visual proportions with the horizontal bar

## [1.4.2] - 2023-04-08

### Changed
- Simplified the progress graph to show only the user's progress line
- Added a horizontal green target line at the total number of tasks
- Modified x-axis to show dates from start to current date only (instead of deadline)
- Removed "Ideal Progress" and "Daily Goal Pace" lines for cleaner visualization
- Adjusted y-axis scale to provide some space above the target line

## [1.4.1] - 2023-04-08

### Fixed
- Fixed blank graph issue when no data is available
- Added informative messages on the graph canvas when no data exists
- Improved error handling in chart generation
- Fixed chart sizing issues by adding default canvas dimensions
- Added delayed chart rendering to ensure proper sizing when the container is made visible

## [1.4.0] - 2023-04-08

### Added
- Progress Graph feature using Chart.js to visualize study progress over time
- Three chart lines: actual progress, ideal linear progress, and daily goal progress
- Toggle button to show/hide the graph as needed
- Graph updates automatically when progress is updated
- Visual representation of how actual progress compares to goals

## [1.3.1] - 2023-04-08

### Added
- Added creator signature "Made with ❤️ by Nawid" in the footer

## [1.3.0] - 2023-04-08

### Added
- Smart tips feature that provides contextual suggestions based on user progress
- Tips to help users optimize their study schedule (e.g., "complete extra tasks today to skip tomorrow")
- Visual indicators for different types of tips with appropriate icons
- Adaptive tip system that only shows relevant suggestions

## [1.2.0] - 2023-04-08

### Added
- Edit completed tasks feature that allows users to directly modify their total completed tasks without resetting
- Modal interface for editing completed tasks count with validation
- User can now easily adjust progress if they made a mistake or need to update their progress

## [1.1.0] - 2023-04-08

### Added
- Daily goal feature that allows users to set their target number of tasks per day
- Progress feedback now considers the user's daily goal rather than using decimal values
- Updated UI to display daily goal in the stats section
- More precise feedback messages based on comparing actual progress with daily goal

### Changed
- Progress calculations now use whole numbers for daily goals instead of decimals
- Feedback messages are more personalized based on daily goals
- Progress bar shows total progress while status considers daily goal progress

## [1.0.0] - 2023-04-08

### Added
- Initial project setup with HTML, CSS, and JavaScript files
- Modern, clean UI design with responsive layout
- Study plan setup form with task name, total tasks, and deadline inputs
- Progress tracking with visual feedback (progress bar)
- Status indicators based on user progress (on track, ahead, behind, way behind)
- Dynamic daily pace calculation based on remaining tasks and time
- History tracking of completed tasks by date
- LocalStorage persistence for all user data
- Export/import functionality for data backup
- Reset option to clear all data
- Responsive design for different screen sizes

### Technical Details
- Used vanilla JavaScript (no frameworks) for maximum compatibility
- Implemented localStorage for data persistence without any backend
- Used modern CSS with variables for consistent styling
- Created a modular state management system in the AppState object
- Added responsive design with mobile-friendly UI adjustments 