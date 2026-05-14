package com.minitrello.controller;

import com.minitrello.entity.BoardListEntity;
import com.minitrello.repository.CardRepository;
import com.minitrello.repository.ListRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
public class ListController {
    private final ListRepository listRepository;
    private final CardRepository cardRepository;
    
    public ListController(ListRepository listRepository, CardRepository cardRepository) {
        this.listRepository = listRepository;
        this.cardRepository = cardRepository;
    }
    
    /**
     * List all lists across all boards.
     */
    @GetMapping
    public List<BoardListEntity> getLists() {
        return listRepository.findAll();
    }
    
    /**
     * List all lists for a given board id.
     */
    @GetMapping("/board/{boardId}")
    public List<BoardListEntity> getListsByBoard(@PathVariable Long boardId) {
        return listRepository.findByBoardId(boardId);
    }
    
    /**
     * Fetch a list by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BoardListEntity> getList(@PathVariable Long id) {
        return listRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new list.
     */
    @PostMapping
    public BoardListEntity createList(@Valid @RequestBody BoardListEntity list) {
        list.setId(null);
        return listRepository.save(list);
    }
    
    /**
     * Update an existing list (name and/or boardId).
     */
    @PutMapping("/{id}")
    public ResponseEntity<BoardListEntity> updateList(@PathVariable Long id, @Valid @RequestBody BoardListEntity list) {
        return listRepository.findById(id)
                .map(existing -> {
                    existing.setName(list.getName());
                    existing.setBoardId(list.getBoardId());
                    return ResponseEntity.ok(listRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete a list.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        if (!listRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cardRepository.deleteAll(cardRepository.findByListId(id));
        listRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
