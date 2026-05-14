package com.minitrello.repository;

import com.minitrello.entity.CardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data repository for {@link CardEntity}.
 */
@Repository
public interface CardRepository extends JpaRepository<CardEntity, Long> {
    List<CardEntity> findByListId(Long listId);
}

