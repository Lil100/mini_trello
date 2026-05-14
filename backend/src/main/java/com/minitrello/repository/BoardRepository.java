package com.minitrello.repository;

import com.minitrello.entity.BoardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data repository for {@link BoardEntity}.
 */
@Repository
public interface BoardRepository extends JpaRepository<BoardEntity, Long> {}

