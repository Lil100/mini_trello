package com.minitrello.controller;

import com.minitrello.entity.CardEntity;
import com.minitrello.repository.CardRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardController {
    private final CardRepository cardRepository;
    
    public CardController(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }
    
    /**
     * List all cards across all boards/lists.
     */
    @GetMapping
    public List<CardEntity> getCards() {
        return cardRepository.findAll();
    }
    
    /**
     * List cards for a given list id.
     */
    @GetMapping("/list/{listId}")
    public List<CardEntity> getCardsByList(@PathVariable Long listId) {
        return cardRepository.findByListId(listId);
    }
    
    /**
     * Fetch a card by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CardEntity> getCard(@PathVariable Long id) {
        return cardRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new card.
     */
    @PostMapping
    public CardEntity createCard(@Valid @RequestBody CardEntity card) {
        card.setId(null);
        return cardRepository.save(card);
    }
    
    /**
     * Update an existing card (title/description/listId).
     */
    @PutMapping("/{id}")
    public ResponseEntity<CardEntity> updateCard(@PathVariable Long id, @Valid @RequestBody CardEntity card) {
        return cardRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(card.getTitle());
                    existing.setDescription(card.getDescription());
                    existing.setListId(card.getListId());
                    return ResponseEntity.ok(cardRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete a card.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        if (!cardRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cardRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
