package com.minitrello.controller;

import com.minitrello.dto.BoardFullResponse;
import com.minitrello.entity.BoardEntity;
import com.minitrello.entity.BoardListEntity;
import com.minitrello.entity.CardEntity;
import com.minitrello.repository.BoardRepository;
import com.minitrello.repository.CardRepository;
import com.minitrello.repository.ListRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/boards")
public class BoardController {
    private final BoardRepository boardRepository;
    private final ListRepository listRepository;
    private final CardRepository cardRepository;
    
    public BoardController(BoardRepository boardRepository, ListRepository listRepository, CardRepository cardRepository) {
        this.boardRepository = boardRepository;
        this.listRepository = listRepository;
        this.cardRepository = cardRepository;
    }
    
    /**
     * List all boards.
     */
    @GetMapping
    public List<BoardEntity> getBoards() {
        return boardRepository.findAll();
    }
    
    /**
     * Fetch a single board by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BoardEntity> getBoard(@PathVariable Long id) {
        return boardRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Fetch a board plus all related lists and cards in one call.
     */
    @GetMapping("/{id}/full")
    public ResponseEntity<BoardFullResponse> getBoardFull(@PathVariable Long id) {
        return boardRepository.findById(id)
                .map(board -> {
                    List<BoardListEntity> boardLists = listRepository.findByBoardId(id);
                    List<CardEntity> boardCards = new ArrayList<>();
                    for (BoardListEntity list : boardLists) {
                        boardCards.addAll(cardRepository.findByListId(list.getId()));
                    }
                    return ResponseEntity.ok(new BoardFullResponse(board, boardLists, boardCards));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new board.
     */
    @PostMapping
    public BoardEntity createBoard(@Valid @RequestBody BoardEntity board) {
        board.setId(null);
        return boardRepository.save(board);
    }
    
    /**
     * Update an existing board's name.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BoardEntity> updateBoard(@PathVariable Long id, @Valid @RequestBody BoardEntity board) {
        return boardRepository.findById(id)
                .map(existing -> {
                    existing.setName(board.getName());
                    return ResponseEntity.ok(boardRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete a board and its related lists/cards.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        if (!boardRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        List<BoardListEntity> boardLists = listRepository.findByBoardId(id);
        for (BoardListEntity list : boardLists) {
            cardRepository.deleteAll(cardRepository.findByListId(list.getId()));
        }
        listRepository.deleteAll(boardLists);
        boardRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
