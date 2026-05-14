package com.minitrello.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * List entity (columns inside a board).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "board_lists")
public class BoardListEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    /**
     * Foreign key reference to the parent board.
     * Kept as a scalar id to keep JSON payloads simple for the vanilla JS frontend.
     */
    @NotNull
    @Column(name = "board_id", nullable = false)
    private Long boardId;
}

