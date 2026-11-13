package com.arigavincent.portfolio.repository;

import com.arigavincent.portfolio.entity.OrderedEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

/** Base repository for hand-ordered content. */
@NoRepositoryBean
public interface OrderedRepository<E extends OrderedEntity> extends JpaRepository<E, Long> {

    List<E> findAllByOrderBySortOrderAscIdAsc();
}
