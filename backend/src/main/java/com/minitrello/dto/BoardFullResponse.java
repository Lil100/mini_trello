package com.minitrello.dto;

import com.minitrello.entity.BoardEntity;
import com.minitrello.entity.BoardListEntity;
import com.minitrello.entity.CardEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * Convenience response for fetching a board with all its lists and cards.
 */
@Getter
@AllArgsConstructor
public class BoardFullResponse {
    private final BoardEntity board;
    private final List<BoardListEntity> lists;
    private final List<CardEntity> cards;
}

