package com.minitrello.repository;

import com.minitrello.entity.BoardListEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data repository for {@link BoardListEntity}.
 */
@Repository
public interface ListRepository extends JpaRepository<BoardListEntity, Long> {
    List<BoardListEntity> findByBoardId(Long boardId);
}

