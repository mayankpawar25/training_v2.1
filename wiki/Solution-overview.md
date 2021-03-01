Training app uses your Microsoft 365 subscription to host the app and to
store any user data

## Training App package

The Training message extension app is implemented as a HTML/JS
application.

The app package contains the following -

* actionManifest JSON file
*  Assets files like app icons, string files etc
*   Different app views for Training creation, Training response,
    Training results.
*   Dependent node packages.

## Training App data storage

Your Microsoft 365 subscription is leveraged to store the data collected
as part of the Training app in form of Training content, Training
responses and Training results. Azure SQL Storage is used to store
actions and responses created, and Azure Blob Storage is used to store
all the media attachments added as part of the action.

Note: Training app is currently not supported for customers with M365
billing region as Canada, South Africa and United Arab Emirates because
of data residency issues.