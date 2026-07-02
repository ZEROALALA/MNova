# Data Model: Desktop Tech Stack

The transition to Electron does not introduce new persistent database models, but it does define a structured IPC payload format for cross-process communication.

## Entities

### `IPCRequest`
- **channel** (String): The IPC channel name (e.g., `dialog:openFile`, `game:launch`)
- **payload** (Object): The parameters for the command

### `IPCResponse`
- **success** (Boolean): Whether the OS operation succeeded
- **data** (Object/String): The requested data or path
- **error** (String): Error message if `success` is false
