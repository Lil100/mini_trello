# Mini Trello

A complete Trello clone with purple and baby pink theme.

## Project Structure

```
miniTrello/
├── backend/              # Spring Boot REST API
│   ├── src/main/java/
│   │   └── com/minitrello/
│   │       ├── MiniTrelloApplication.java
│   │       ├── controller/
│   │       │   ├── BoardController.java
│   │       │   ├── ListController.java
│   │       │   └── CardController.java
│   │       ├── model/
│   │       │   ├── Board.java
│   │       │   ├── List.java
│   │       │   └── Card.java
│   │       └── repository/
│   │           ├── BoardRepository.java
│   │           ├── ListRepository.java
│   │           └── CardRepository.java
│   └── pom.xml
└── frontend/             # Vanilla JS Frontend
    ├── index.html
    ├── js/app.js
    └── css/style.css
```

## Backend API Endpoints

### Auth (JWT)
- `POST /api/auth/register` - Register a new user (returns JWT)
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Current user (requires JWT)

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/{id}` - Get single board
- `GET /api/boards/{id}/full` - Get board + lists + cards
- `POST /api/boards` - Create board
- `PUT /api/boards/{id}` - Update board
- `DELETE /api/boards/{id}` - Delete board

### Lists
- `GET /api/lists` - Get all lists
- `GET /api/lists/board/{boardId}` - Get lists by board
- `GET /api/lists/{id}` - Get single list
- `POST /api/lists` - Create list
- `PUT /api/lists/{id}` - Update list
- `DELETE /api/lists/{id}` - Delete list

### Cards
- `GET /api/cards` - Get all cards
- `GET /api/cards/list/{listId}` - Get cards by list
- `GET /api/cards/{id}` - Get single card
- `POST /api/cards` - Create card
- `PUT /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card

## Running the Application

### Backend
```bash
cd backend
mvn spring-boot:run
```
Server runs on http://localhost:8080
Swagger UI runs on http://localhost:8080/swagger

MariaDB defaults are configured in `backend/src/main/resources/application.properties`.

### Frontend
Serve the frontend files using a simple HTTP server:
```bash
cd frontend
npx serve . -p 3000
```
Or use any static file server on port 3000.

## Theme Colors
- Primary Purple: `#9b5de5`
- Dark Purple: `#7a4cbf`
- Baby Pink: `#ffc8e3`
- Light Baby Pink: `#ffe6f0`
