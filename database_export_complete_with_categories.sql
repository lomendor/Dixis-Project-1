--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS wishlists_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS wishlists_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.user_product_interactions DROP CONSTRAINT IF EXISTS user_product_interactions_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.user_product_interactions DROP CONSTRAINT IF EXISTS user_product_interactions_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.user_preference_updates DROP CONSTRAINT IF EXISTS user_preference_updates_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.user_preference_updates DROP CONSTRAINT IF EXISTS user_preference_updates_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.user_behavior_events DROP CONSTRAINT IF EXISTS user_behavior_events_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.user_behavior_events DROP CONSTRAINT IF EXISTS user_behavior_events_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.user_behavior_events DROP CONSTRAINT IF EXISTS user_behavior_events_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.user_behavior_events DROP CONSTRAINT IF EXISTS user_behavior_events_category_id_foreign;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_owner_id_foreign;
ALTER TABLE IF EXISTS ONLY public.tenant_themes DROP CONSTRAINT IF EXISTS tenant_themes_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_foreign;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_payment_id_foreign;
ALTER TABLE IF EXISTS ONLY public.shipping_rates DROP CONSTRAINT IF EXISTS shipping_rates_weight_tier_id_foreign;
ALTER TABLE IF EXISTS ONLY public.shipping_rates DROP CONSTRAINT IF EXISTS shipping_rates_shipping_zone_id_foreign;
ALTER TABLE IF EXISTS ONLY public.shipping_rates DROP CONSTRAINT IF EXISTS shipping_rates_delivery_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public.role_has_permissions DROP CONSTRAINT IF EXISTS role_has_permissions_role_id_foreign;
ALTER TABLE IF EXISTS ONLY public.role_has_permissions DROP CONSTRAINT IF EXISTS role_has_permissions_permission_id_foreign;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.revenue_shares DROP CONSTRAINT IF EXISTS revenue_shares_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.revenue_shares DROP CONSTRAINT IF EXISTS revenue_shares_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.recommendation_logs DROP CONSTRAINT IF EXISTS recommendation_logs_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_created_by_foreign;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_converted_to_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_business_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_approved_by_foreign;
ALTER TABLE IF EXISTS ONLY public.quote_items DROP CONSTRAINT IF EXISTS quote_items_quote_id_foreign;
ALTER TABLE IF EXISTS ONLY public.quote_items DROP CONSTRAINT IF EXISTS quote_items_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.quickbooks_tokens DROP CONSTRAINT IF EXISTS quickbooks_tokens_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_questions DROP CONSTRAINT IF EXISTS product_questions_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_questions DROP CONSTRAINT IF EXISTS product_questions_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_questions DROP CONSTRAINT IF EXISTS product_questions_answered_by_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_cost_breakdowns DROP CONSTRAINT IF EXISTS product_cost_breakdowns_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_category_relations DROP CONSTRAINT IF EXISTS product_category_relations_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_category_relations DROP CONSTRAINT IF EXISTS product_category_relations_category_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_categories DROP CONSTRAINT IF EXISTS product_categories_parent_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_attribute_values DROP CONSTRAINT IF EXISTS product_attribute_values_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_attribute_values DROP CONSTRAINT IF EXISTS product_attribute_values_attribute_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producers DROP CONSTRAINT IF EXISTS producers_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producers DROP CONSTRAINT IF EXISTS producers_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_shipping_rates DROP CONSTRAINT IF EXISTS producer_shipping_rates_weight_tier_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_shipping_rates DROP CONSTRAINT IF EXISTS producer_shipping_rates_shipping_zone_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_shipping_rates DROP CONSTRAINT IF EXISTS producer_shipping_rates_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_shipping_rates DROP CONSTRAINT IF EXISTS producer_shipping_rates_delivery_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_shipping_methods DROP CONSTRAINT IF EXISTS producer_shipping_methods_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_shipping_methods DROP CONSTRAINT IF EXISTS producer_shipping_methods_delivery_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_reviews DROP CONSTRAINT IF EXISTS producer_reviews_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_reviews DROP CONSTRAINT IF EXISTS producer_reviews_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_questions DROP CONSTRAINT IF EXISTS producer_questions_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_questions DROP CONSTRAINT IF EXISTS producer_questions_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_profiles DROP CONSTRAINT IF EXISTS producer_profiles_verified_by_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_profiles DROP CONSTRAINT IF EXISTS producer_profiles_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_media DROP CONSTRAINT IF EXISTS producer_media_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_free_shipping DROP CONSTRAINT IF EXISTS producer_free_shipping_shipping_zone_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_free_shipping DROP CONSTRAINT IF EXISTS producer_free_shipping_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_free_shipping DROP CONSTRAINT IF EXISTS producer_free_shipping_delivery_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_environmental_stats DROP CONSTRAINT IF EXISTS producer_environmental_stats_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.producer_documents DROP CONSTRAINT IF EXISTS producer_documents_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.postal_code_zones DROP CONSTRAINT IF EXISTS postal_code_zones_shipping_zone_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_shipping_address_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_quote_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_contract_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_business_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_billing_address_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.model_has_roles DROP CONSTRAINT IF EXISTS model_has_roles_role_id_foreign;
ALTER TABLE IF EXISTS ONLY public.model_has_permissions DROP CONSTRAINT IF EXISTS model_has_permissions_permission_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoice_payments DROP CONSTRAINT IF EXISTS invoice_payments_invoice_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoice_items DROP CONSTRAINT IF EXISTS invoice_items_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoice_items DROP CONSTRAINT IF EXISTS invoice_items_invoice_id_foreign;
ALTER TABLE IF EXISTS ONLY public.integration_settings DROP CONSTRAINT IF EXISTS integration_settings_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS fk_products_category_id;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.extra_weight_charges DROP CONSTRAINT IF EXISTS extra_weight_charges_shipping_zone_id_foreign;
ALTER TABLE IF EXISTS ONLY public.extra_weight_charges DROP CONSTRAINT IF EXISTS extra_weight_charges_delivery_method_id_foreign;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_created_by_foreign;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_business_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_approved_by_foreign;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS carts_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_cart_id_foreign;
ALTER TABLE IF EXISTS ONLY public.businesses DROP CONSTRAINT IF EXISTS businesses_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.business_users DROP CONSTRAINT IF EXISTS business_users_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.business_users DROP CONSTRAINT IF EXISTS business_users_tenant_id_foreign;
ALTER TABLE IF EXISTS ONLY public.adoptions DROP CONSTRAINT IF EXISTS adoptions_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.adoptions DROP CONSTRAINT IF EXISTS adoptions_adoption_plan_id_foreign;
ALTER TABLE IF EXISTS ONLY public.adoptions DROP CONSTRAINT IF EXISTS adoptions_adoptable_item_id_foreign;
ALTER TABLE IF EXISTS ONLY public.adoption_updates DROP CONSTRAINT IF EXISTS adoption_updates_adoption_id_foreign;
ALTER TABLE IF EXISTS ONLY public.adoption_plans DROP CONSTRAINT IF EXISTS adoption_plans_adoptable_item_id_foreign;
ALTER TABLE IF EXISTS ONLY public.adoptable_items DROP CONSTRAINT IF EXISTS adoptable_items_producer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.addresses DROP CONSTRAINT IF EXISTS addresses_user_id_foreign;
DROP INDEX IF EXISTS public.users_tenant_id_index;
DROP INDEX IF EXISTS public.users_stripe_customer_id_index;
DROP INDEX IF EXISTS public.users_quickbooks_customer_id_index;
DROP INDEX IF EXISTS public.user_product_interactions_user_id_rating_index;
DROP INDEX IF EXISTS public.user_product_interactions_product_id_rating_index;
DROP INDEX IF EXISTS public.user_product_interactions_last_interaction_index;
DROP INDEX IF EXISTS public.user_preference_updates_user_id_created_at_index;
DROP INDEX IF EXISTS public.user_preference_updates_product_id_action_index;
DROP INDEX IF EXISTS public.user_preference_updates_action_created_at_index;
DROP INDEX IF EXISTS public.user_behavior_events_user_id_created_at_index;
DROP INDEX IF EXISTS public.user_behavior_events_session_id_index;
DROP INDEX IF EXISTS public.user_behavior_events_session_id_created_at_index;
DROP INDEX IF EXISTS public.user_behavior_events_search_query_index;
DROP INDEX IF EXISTS public.user_behavior_events_product_id_event_type_created_at_index;
DROP INDEX IF EXISTS public.user_behavior_events_event_type_index;
DROP INDEX IF EXISTS public.user_behavior_events_event_type_created_at_index;
DROP INDEX IF EXISTS public.user_behavior_events_created_at_index;
DROP INDEX IF EXISTS public.user_behavior_events_created_at_event_type_index;
DROP INDEX IF EXISTS public.tenants_trial_ends_at_index;
DROP INDEX IF EXISTS public.tenants_subscription_expires_at_index;
DROP INDEX IF EXISTS public.tenants_status_plan_index;
DROP INDEX IF EXISTS public.subscriptions_subscribable_type_subscribable_id_index;
DROP INDEX IF EXISTS public.shipping_tracking_events_tracking_number_index;
DROP INDEX IF EXISTS public.shipping_tracking_events_tracking_number_event_timestamp_index;
DROP INDEX IF EXISTS public.shipping_tracking_events_provider_index;
DROP INDEX IF EXISTS public.shipping_tracking_events_event_type_index;
DROP INDEX IF EXISTS public.shipping_tracking_events_event_timestamp_index;
DROP INDEX IF EXISTS public.sessions_user_id_index;
DROP INDEX IF EXISTS public.sessions_last_activity_index;
DROP INDEX IF EXISTS public.reviews_tenant_id_index;
DROP INDEX IF EXISTS public.revenue_shares_transaction_type_status_index;
DROP INDEX IF EXISTS public.revenue_shares_tenant_id_status_index;
DROP INDEX IF EXISTS public.revenue_shares_processed_at_index;
DROP INDEX IF EXISTS public.revenue_shares_payout_date_index;
DROP INDEX IF EXISTS public.recommendation_logs_user_id_served_at_index;
DROP INDEX IF EXISTS public.recommendation_logs_context_served_at_index;
DROP INDEX IF EXISTS public.recommendation_logs_clicked_at_index;
DROP INDEX IF EXISTS public.recommendation_logs_algorithm_served_at_index;
DROP INDEX IF EXISTS public.quotes_valid_until_index;
DROP INDEX IF EXISTS public.quotes_status_index;
DROP INDEX IF EXISTS public.quotes_created_by_index;
DROP INDEX IF EXISTS public.quotes_business_user_id_status_index;
DROP INDEX IF EXISTS public.quote_items_quote_id_index;
DROP INDEX IF EXISTS public.quote_items_product_id_index;
DROP INDEX IF EXISTS public.quickbooks_tokens_user_id_company_id_index;
DROP INDEX IF EXISTS public.products_tenant_id_index;
DROP INDEX IF EXISTS public.products_status_index;
DROP INDEX IF EXISTS public.products_quickbooks_item_id_index;
DROP INDEX IF EXISTS public.products_producer_id_status_index;
DROP INDEX IF EXISTS public.products_min_order_quantity_index;
DROP INDEX IF EXISTS public.products_b2b_available_index;
DROP INDEX IF EXISTS public.product_questions_product_id_index;
DROP INDEX IF EXISTS public.producers_tenant_id_index;
DROP INDEX IF EXISTS public.producer_profiles_verification_status_index;
DROP INDEX IF EXISTS public.producer_profiles_trust_level_index;
DROP INDEX IF EXISTS public.producer_profiles_location_lat_location_lng_index;
DROP INDEX IF EXISTS public.personal_access_tokens_tokenable_type_tokenable_id_index;
DROP INDEX IF EXISTS public.orders_tracking_number_index;
DROP INDEX IF EXISTS public.orders_tenant_id_index;
DROP INDEX IF EXISTS public.orders_shipping_provider_index;
DROP INDEX IF EXISTS public.orders_shipped_at_index;
DROP INDEX IF EXISTS public.orders_quickbooks_invoice_id_index;
DROP INDEX IF EXISTS public.orders_payment_due_date_index;
DROP INDEX IF EXISTS public.orders_order_type_index;
DROP INDEX IF EXISTS public.orders_delivered_at_index;
DROP INDEX IF EXISTS public.orders_business_user_id_index;
DROP INDEX IF EXISTS public.model_has_roles_model_id_model_type_index;
DROP INDEX IF EXISTS public.model_has_permissions_model_id_model_type_index;
DROP INDEX IF EXISTS public.jobs_queue_index;
DROP INDEX IF EXISTS public.invoices_user_id_status_index;
DROP INDEX IF EXISTS public.invoices_tenant_id_index;
DROP INDEX IF EXISTS public.invoices_status_due_date_index;
DROP INDEX IF EXISTS public.invoices_invoice_number_index;
DROP INDEX IF EXISTS public.invoice_payments_transaction_id_index;
DROP INDEX IF EXISTS public.invoice_payments_tenant_id_index;
DROP INDEX IF EXISTS public.invoice_payments_payment_method_status_index;
DROP INDEX IF EXISTS public.invoice_payments_invoice_id_index;
DROP INDEX IF EXISTS public.invoice_items_tenant_id_index;
DROP INDEX IF EXISTS public.invoice_items_product_id_index;
DROP INDEX IF EXISTS public.invoice_items_invoice_id_index;
DROP INDEX IF EXISTS public.integration_settings_service_is_active_index;
DROP INDEX IF EXISTS public.integration_logs_service_name_status_index;
DROP INDEX IF EXISTS public.integration_logs_model_type_model_id_index;
DROP INDEX IF EXISTS public.idx_users_role_created;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_products_stock;
DROP INDEX IF EXISTS public.idx_products_producer_id;
DROP INDEX IF EXISTS public.idx_products_producer_active;
DROP INDEX IF EXISTS public.idx_products_price;
DROP INDEX IF EXISTS public.idx_products_is_featured;
DROP INDEX IF EXISTS public.idx_products_is_active;
DROP INDEX IF EXISTS public.idx_products_created_at;
DROP INDEX IF EXISTS public.idx_products_category_id;
DROP INDEX IF EXISTS public.idx_products_category_active;
DROP INDEX IF EXISTS public.idx_products_active_price;
DROP INDEX IF EXISTS public.idx_products_active_featured;
DROP INDEX IF EXISTS public.idx_products_active_created;
DROP INDEX IF EXISTS public.idx_product_images_product_sort;
DROP INDEX IF EXISTS public.idx_product_category_product;
DROP INDEX IF EXISTS public.idx_product_category_category;
DROP INDEX IF EXISTS public.idx_product_category_both;
DROP INDEX IF EXISTS public.idx_producers_verified_created;
DROP INDEX IF EXISTS public.idx_producers_verified;
DROP INDEX IF EXISTS public.idx_producers_user_id;
DROP INDEX IF EXISTS public.idx_producers_business_name;
DROP INDEX IF EXISTS public.idx_orders_user_status;
DROP INDEX IF EXISTS public.idx_orders_user_id;
DROP INDEX IF EXISTS public.idx_orders_total_amount;
DROP INDEX IF EXISTS public.idx_orders_status_created;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_created_at;
DROP INDEX IF EXISTS public.idx_orders_created_amount;
DROP INDEX IF EXISTS public.idx_order_items_product_id;
DROP INDEX IF EXISTS public.idx_order_items_order_product;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_categories_slug;
DROP INDEX IF EXISTS public.idx_carts_user_expires;
DROP INDEX IF EXISTS public.idx_carts_session_id;
DROP INDEX IF EXISTS public.idx_carts_expires_at;
DROP INDEX IF EXISTS public.idx_cart_items_product_id;
DROP INDEX IF EXISTS public.idx_cart_items_cart_product;
DROP INDEX IF EXISTS public.contracts_type_index;
DROP INDEX IF EXISTS public.contracts_status_index;
DROP INDEX IF EXISTS public.contracts_start_date_end_date_index;
DROP INDEX IF EXISTS public.contracts_business_user_id_status_index;
DROP INDEX IF EXISTS public.categories_tenant_id_index;
DROP INDEX IF EXISTS public.carts_session_id_index;
DROP INDEX IF EXISTS public.business_users_status_verification_status_index;
DROP INDEX IF EXISTS public.business_users_discount_tier_index;
DROP INDEX IF EXISTS public.business_users_business_type_index;
ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS wishlists_user_id_product_id_unique;
ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS wishlists_pkey;
ALTER TABLE IF EXISTS ONLY public.weight_tiers DROP CONSTRAINT IF EXISTS weight_tiers_pkey;
ALTER TABLE IF EXISTS ONLY public.weight_tiers DROP CONSTRAINT IF EXISTS weight_tiers_min_weight_grams_max_weight_grams_unique;
ALTER TABLE IF EXISTS ONLY public.weight_tiers DROP CONSTRAINT IF EXISTS weight_tiers_code_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_stripe_customer_id_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_google_id_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.user_product_interactions DROP CONSTRAINT IF EXISTS user_product_interactions_user_id_product_id_unique;
ALTER TABLE IF EXISTS ONLY public.user_product_interactions DROP CONSTRAINT IF EXISTS user_product_interactions_pkey;
ALTER TABLE IF EXISTS ONLY public.user_preference_updates DROP CONSTRAINT IF EXISTS user_preference_updates_pkey;
ALTER TABLE IF EXISTS ONLY public.user_behavior_events DROP CONSTRAINT IF EXISTS user_behavior_events_pkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_subdomain_unique;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_slug_unique;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_domain_unique;
ALTER TABLE IF EXISTS ONLY public.tenant_themes DROP CONSTRAINT IF EXISTS tenant_themes_tenant_id_unique;
ALTER TABLE IF EXISTS ONLY public.tenant_themes DROP CONSTRAINT IF EXISTS tenant_themes_pkey;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_zones DROP CONSTRAINT IF EXISTS shipping_zones_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_zones DROP CONSTRAINT IF EXISTS shipping_zones_name_unique;
ALTER TABLE IF EXISTS ONLY public.shipping_tracking_events DROP CONSTRAINT IF EXISTS shipping_tracking_events_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_rates DROP CONSTRAINT IF EXISTS shipping_rates_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_rates DROP CONSTRAINT IF EXISTS shipping_rate_unique;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_key_unique;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_name_guard_name_unique;
ALTER TABLE IF EXISTS ONLY public.role_has_permissions DROP CONSTRAINT IF EXISTS role_has_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_product_id_unique;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.revenue_shares DROP CONSTRAINT IF EXISTS revenue_shares_pkey;
ALTER TABLE IF EXISTS ONLY public.recommendation_logs DROP CONSTRAINT IF EXISTS recommendation_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_quote_number_unique;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_pkey;
ALTER TABLE IF EXISTS ONLY public.quote_items DROP CONSTRAINT IF EXISTS quote_items_pkey;
ALTER TABLE IF EXISTS ONLY public.quickbooks_tokens DROP CONSTRAINT IF EXISTS quickbooks_tokens_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.quickbooks_tokens DROP CONSTRAINT IF EXISTS quickbooks_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_slug_unique;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_sku_unique;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_questions DROP CONSTRAINT IF EXISTS product_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_pkey;
ALTER TABLE IF EXISTS ONLY public.product_cost_breakdowns DROP CONSTRAINT IF EXISTS product_cost_breakdowns_pkey;
ALTER TABLE IF EXISTS ONLY public.product_category_relations DROP CONSTRAINT IF EXISTS product_category_relations_product_id_category_id_unique;
ALTER TABLE IF EXISTS ONLY public.product_category_relations DROP CONSTRAINT IF EXISTS product_category_relations_pkey;
ALTER TABLE IF EXISTS ONLY public.product_categories DROP CONSTRAINT IF EXISTS product_categories_slug_unique;
ALTER TABLE IF EXISTS ONLY public.product_categories DROP CONSTRAINT IF EXISTS product_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.product_attributes DROP CONSTRAINT IF EXISTS product_attributes_slug_unique;
ALTER TABLE IF EXISTS ONLY public.product_attributes DROP CONSTRAINT IF EXISTS product_attributes_pkey;
ALTER TABLE IF EXISTS ONLY public.product_attribute_values DROP CONSTRAINT IF EXISTS product_attribute_values_product_id_attribute_id_unique;
ALTER TABLE IF EXISTS ONLY public.product_attribute_values DROP CONSTRAINT IF EXISTS product_attribute_values_pkey;
ALTER TABLE IF EXISTS ONLY public.producers DROP CONSTRAINT IF EXISTS producers_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.producers DROP CONSTRAINT IF EXISTS producers_pkey;
ALTER TABLE IF EXISTS ONLY public.producer_shipping_rates DROP CONSTRAINT IF EXISTS producer_shipping_rates_pkey;
ALTER TABLE IF EXISTS ONLY public.producer_shipping_rates DROP CONSTRAINT IF EXISTS producer_shipping_rate_unique;
ALTER TABLE IF EXISTS ONLY public.producer_shipping_methods DROP CONSTRAINT IF EXISTS producer_shipping_methods_pkey;
ALTER TABLE IF EXISTS ONLY public.producer_reviews DROP CONSTRAINT IF EXISTS producer_reviews_user_id_producer_id_unique;
ALTER TABLE IF EXISTS ONLY public.producer_reviews DROP CONSTRAINT IF EXISTS producer_reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.producer_questions DROP CONSTRAINT IF EXISTS producer_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.producer_profiles DROP CONSTRAINT IF EXISTS producer_profiles_tax_number_unique;
ALTER TABLE IF EXISTS ONLY public.producer_profiles DROP CONSTRAINT IF EXISTS producer_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.producer_shipping_methods DROP CONSTRAINT IF EXISTS producer_method_unique;
ALTER TABLE IF EXISTS ONLY public.producer_media DROP CONSTRAINT IF EXISTS producer_media_pkey;
ALTER TABLE IF EXISTS ONLY public.producer_free_shipping DROP CONSTRAINT IF EXISTS producer_free_shipping_unique;
ALTER TABLE IF EXISTS ONLY public.producer_free_shipping DROP CONSTRAINT IF EXISTS producer_free_shipping_pkey;
ALTER TABLE IF EXISTS ONLY public.producer_environmental_stats DROP CONSTRAINT IF EXISTS producer_environmental_stats_pkey;
ALTER TABLE IF EXISTS ONLY public.producer_documents DROP CONSTRAINT IF EXISTS producer_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.postal_code_zones DROP CONSTRAINT IF EXISTS postal_code_zones_postal_code_prefix_unique;
ALTER TABLE IF EXISTS ONLY public.postal_code_zones DROP CONSTRAINT IF EXISTS postal_code_zones_pkey;
ALTER TABLE IF EXISTS ONLY public.personal_access_tokens DROP CONSTRAINT IF EXISTS personal_access_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY public.personal_access_tokens DROP CONSTRAINT IF EXISTS personal_access_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_name_guard_name_unique;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_transaction_id_unique;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_stripe_payment_intent_id_unique;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.model_has_roles DROP CONSTRAINT IF EXISTS model_has_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.model_has_permissions DROP CONSTRAINT IF EXISTS model_has_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.jobs DROP CONSTRAINT IF EXISTS jobs_pkey;
ALTER TABLE IF EXISTS ONLY public.job_batches DROP CONSTRAINT IF EXISTS job_batches_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_unique;
ALTER TABLE IF EXISTS ONLY public.invoice_payments DROP CONSTRAINT IF EXISTS invoice_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.invoice_items DROP CONSTRAINT IF EXISTS invoice_items_pkey;
ALTER TABLE IF EXISTS ONLY public.integration_settings DROP CONSTRAINT IF EXISTS integration_settings_service_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.integration_settings DROP CONSTRAINT IF EXISTS integration_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.integration_logs DROP CONSTRAINT IF EXISTS integration_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_unique;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_pkey;
ALTER TABLE IF EXISTS ONLY public.failed_jobs DROP CONSTRAINT IF EXISTS failed_jobs_uuid_unique;
ALTER TABLE IF EXISTS ONLY public.failed_jobs DROP CONSTRAINT IF EXISTS failed_jobs_pkey;
ALTER TABLE IF EXISTS ONLY public.extra_weight_charges DROP CONSTRAINT IF EXISTS extra_weight_charges_pkey;
ALTER TABLE IF EXISTS ONLY public.extra_weight_charges DROP CONSTRAINT IF EXISTS extra_weight_charge_unique;
ALTER TABLE IF EXISTS ONLY public.delivery_methods DROP CONSTRAINT IF EXISTS delivery_methods_pkey;
ALTER TABLE IF EXISTS ONLY public.delivery_methods DROP CONSTRAINT IF EXISTS delivery_methods_code_unique;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_pkey;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_contract_number_unique;
ALTER TABLE IF EXISTS ONLY public.contact_messages DROP CONSTRAINT IF EXISTS contact_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS carts_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS carts_session_id_unique;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS carts_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_cart_id_product_id_unique;
ALTER TABLE IF EXISTS ONLY public.cache DROP CONSTRAINT IF EXISTS cache_pkey;
ALTER TABLE IF EXISTS ONLY public.cache_locks DROP CONSTRAINT IF EXISTS cache_locks_pkey;
ALTER TABLE IF EXISTS ONLY public.businesses DROP CONSTRAINT IF EXISTS businesses_pkey;
ALTER TABLE IF EXISTS ONLY public.business_users DROP CONSTRAINT IF EXISTS business_users_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.business_users DROP CONSTRAINT IF EXISTS business_users_pkey;
ALTER TABLE IF EXISTS ONLY public.adoptions DROP CONSTRAINT IF EXISTS adoptions_pkey;
ALTER TABLE IF EXISTS ONLY public.adoptions DROP CONSTRAINT IF EXISTS adoptions_certificate_number_unique;
ALTER TABLE IF EXISTS ONLY public.adoption_updates DROP CONSTRAINT IF EXISTS adoption_updates_pkey;
ALTER TABLE IF EXISTS ONLY public.adoption_plans DROP CONSTRAINT IF EXISTS adoption_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.adoptable_items DROP CONSTRAINT IF EXISTS adoptable_items_slug_unique;
ALTER TABLE IF EXISTS ONLY public.adoptable_items DROP CONSTRAINT IF EXISTS adoptable_items_pkey;
ALTER TABLE IF EXISTS ONLY public.addresses DROP CONSTRAINT IF EXISTS addresses_pkey;
ALTER TABLE IF EXISTS ONLY public.additional_charges DROP CONSTRAINT IF EXISTS additional_charges_pkey;
ALTER TABLE IF EXISTS ONLY public.additional_charges DROP CONSTRAINT IF EXISTS additional_charges_code_unique;
ALTER TABLE IF EXISTS public.wishlists ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.weight_tiers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_product_interactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_preference_updates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_behavior_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tenants ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tenant_themes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.subscriptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.subscription_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shipping_zones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shipping_tracking_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shipping_rates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.revenue_shares ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.recommendation_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.quotes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.quote_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.quickbooks_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_questions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_images ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_cost_breakdowns ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_category_relations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_attributes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_attribute_values ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producer_shipping_rates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producer_shipping_methods ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producer_reviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producer_questions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producer_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producer_media ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producer_free_shipping ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producer_environmental_stats ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producer_documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.postal_code_zones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.personal_access_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.migrations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.jobs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.invoice_payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.invoice_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.integration_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.integration_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.favorites ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.failed_jobs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.extra_weight_charges ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.delivery_methods ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.contracts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.contact_messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.carts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cart_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.businesses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.business_users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.adoptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.adoption_updates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.adoption_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.adoptable_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.addresses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.additional_charges ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.wishlists_id_seq;
DROP TABLE IF EXISTS public.wishlists;
DROP SEQUENCE IF EXISTS public.weight_tiers_id_seq;
DROP TABLE IF EXISTS public.weight_tiers;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_product_interactions_id_seq;
DROP TABLE IF EXISTS public.user_product_interactions;
DROP SEQUENCE IF EXISTS public.user_preference_updates_id_seq;
DROP TABLE IF EXISTS public.user_preference_updates;
DROP SEQUENCE IF EXISTS public.user_behavior_events_id_seq;
DROP TABLE IF EXISTS public.user_behavior_events;
DROP SEQUENCE IF EXISTS public.tenants_id_seq;
DROP TABLE IF EXISTS public.tenants;
DROP SEQUENCE IF EXISTS public.tenant_themes_id_seq;
DROP TABLE IF EXISTS public.tenant_themes;
DROP SEQUENCE IF EXISTS public.subscriptions_id_seq;
DROP TABLE IF EXISTS public.subscriptions;
DROP SEQUENCE IF EXISTS public.subscription_plans_id_seq;
DROP TABLE IF EXISTS public.subscription_plans;
DROP SEQUENCE IF EXISTS public.shipping_zones_id_seq;
DROP TABLE IF EXISTS public.shipping_zones;
DROP SEQUENCE IF EXISTS public.shipping_tracking_events_id_seq;
DROP TABLE IF EXISTS public.shipping_tracking_events;
DROP SEQUENCE IF EXISTS public.shipping_rates_id_seq;
DROP TABLE IF EXISTS public.shipping_rates;
DROP SEQUENCE IF EXISTS public.settings_id_seq;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.sessions;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_has_permissions;
DROP SEQUENCE IF EXISTS public.reviews_id_seq;
DROP TABLE IF EXISTS public.reviews;
DROP SEQUENCE IF EXISTS public.revenue_shares_id_seq;
DROP TABLE IF EXISTS public.revenue_shares;
DROP SEQUENCE IF EXISTS public.recommendation_logs_id_seq;
DROP TABLE IF EXISTS public.recommendation_logs;
DROP SEQUENCE IF EXISTS public.quotes_id_seq;
DROP TABLE IF EXISTS public.quotes;
DROP SEQUENCE IF EXISTS public.quote_items_id_seq;
DROP TABLE IF EXISTS public.quote_items;
DROP SEQUENCE IF EXISTS public.quickbooks_tokens_id_seq;
DROP TABLE IF EXISTS public.quickbooks_tokens;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP SEQUENCE IF EXISTS public.product_questions_id_seq;
DROP TABLE IF EXISTS public.product_questions;
DROP SEQUENCE IF EXISTS public.product_images_id_seq;
DROP TABLE IF EXISTS public.product_images;
DROP SEQUENCE IF EXISTS public.product_cost_breakdowns_id_seq;
DROP TABLE IF EXISTS public.product_cost_breakdowns;
DROP SEQUENCE IF EXISTS public.product_category_relations_id_seq;
DROP TABLE IF EXISTS public.product_category_relations;
DROP SEQUENCE IF EXISTS public.product_categories_id_seq;
DROP TABLE IF EXISTS public.product_categories;
DROP SEQUENCE IF EXISTS public.product_attributes_id_seq;
DROP TABLE IF EXISTS public.product_attributes;
DROP SEQUENCE IF EXISTS public.product_attribute_values_id_seq;
DROP TABLE IF EXISTS public.product_attribute_values;
DROP SEQUENCE IF EXISTS public.producers_id_seq;
DROP TABLE IF EXISTS public.producers;
DROP SEQUENCE IF EXISTS public.producer_shipping_rates_id_seq;
DROP TABLE IF EXISTS public.producer_shipping_rates;
DROP SEQUENCE IF EXISTS public.producer_shipping_methods_id_seq;
DROP TABLE IF EXISTS public.producer_shipping_methods;
DROP SEQUENCE IF EXISTS public.producer_reviews_id_seq;
DROP TABLE IF EXISTS public.producer_reviews;
DROP SEQUENCE IF EXISTS public.producer_questions_id_seq;
DROP TABLE IF EXISTS public.producer_questions;
DROP SEQUENCE IF EXISTS public.producer_profiles_id_seq;
DROP TABLE IF EXISTS public.producer_profiles;
DROP SEQUENCE IF EXISTS public.producer_media_id_seq;
DROP TABLE IF EXISTS public.producer_media;
DROP SEQUENCE IF EXISTS public.producer_free_shipping_id_seq;
DROP TABLE IF EXISTS public.producer_free_shipping;
DROP SEQUENCE IF EXISTS public.producer_environmental_stats_id_seq;
DROP TABLE IF EXISTS public.producer_environmental_stats;
DROP SEQUENCE IF EXISTS public.producer_documents_id_seq;
DROP TABLE IF EXISTS public.producer_documents;
DROP SEQUENCE IF EXISTS public.postal_code_zones_id_seq;
DROP TABLE IF EXISTS public.postal_code_zones;
DROP SEQUENCE IF EXISTS public.personal_access_tokens_id_seq;
DROP TABLE IF EXISTS public.personal_access_tokens;
DROP SEQUENCE IF EXISTS public.permissions_id_seq;
DROP TABLE IF EXISTS public.permissions;
DROP SEQUENCE IF EXISTS public.payments_id_seq;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.model_has_roles;
DROP TABLE IF EXISTS public.model_has_permissions;
DROP SEQUENCE IF EXISTS public.migrations_id_seq;
DROP TABLE IF EXISTS public.migrations;
DROP SEQUENCE IF EXISTS public.jobs_id_seq;
DROP TABLE IF EXISTS public.jobs;
DROP TABLE IF EXISTS public.job_batches;
DROP SEQUENCE IF EXISTS public.invoices_id_seq;
DROP TABLE IF EXISTS public.invoices;
DROP SEQUENCE IF EXISTS public.invoice_payments_id_seq;
DROP TABLE IF EXISTS public.invoice_payments;
DROP SEQUENCE IF EXISTS public.invoice_items_id_seq;
DROP TABLE IF EXISTS public.invoice_items;
DROP SEQUENCE IF EXISTS public.integration_settings_id_seq;
DROP TABLE IF EXISTS public.integration_settings;
DROP SEQUENCE IF EXISTS public.integration_logs_id_seq;
DROP TABLE IF EXISTS public.integration_logs;
DROP SEQUENCE IF EXISTS public.favorites_id_seq;
DROP TABLE IF EXISTS public.favorites;
DROP SEQUENCE IF EXISTS public.failed_jobs_id_seq;
DROP TABLE IF EXISTS public.failed_jobs;
DROP SEQUENCE IF EXISTS public.extra_weight_charges_id_seq;
DROP TABLE IF EXISTS public.extra_weight_charges;
DROP SEQUENCE IF EXISTS public.delivery_methods_id_seq;
DROP TABLE IF EXISTS public.delivery_methods;
DROP SEQUENCE IF EXISTS public.contracts_id_seq;
DROP TABLE IF EXISTS public.contracts;
DROP SEQUENCE IF EXISTS public.contact_messages_id_seq;
DROP TABLE IF EXISTS public.contact_messages;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.carts_id_seq;
DROP TABLE IF EXISTS public.carts;
DROP SEQUENCE IF EXISTS public.cart_items_id_seq;
DROP TABLE IF EXISTS public.cart_items;
DROP TABLE IF EXISTS public.cache_locks;
DROP TABLE IF EXISTS public.cache;
DROP SEQUENCE IF EXISTS public.businesses_id_seq;
DROP TABLE IF EXISTS public.businesses;
DROP SEQUENCE IF EXISTS public.business_users_id_seq;
DROP TABLE IF EXISTS public.business_users;
DROP SEQUENCE IF EXISTS public.adoptions_id_seq;
DROP TABLE IF EXISTS public.adoptions;
DROP SEQUENCE IF EXISTS public.adoption_updates_id_seq;
DROP TABLE IF EXISTS public.adoption_updates;
DROP SEQUENCE IF EXISTS public.adoption_plans_id_seq;
DROP TABLE IF EXISTS public.adoption_plans;
DROP SEQUENCE IF EXISTS public.adoptable_items_id_seq;
DROP TABLE IF EXISTS public.adoptable_items;
DROP SEQUENCE IF EXISTS public.addresses_id_seq;
DROP TABLE IF EXISTS public.addresses;
DROP SEQUENCE IF EXISTS public.additional_charges_id_seq;
DROP TABLE IF EXISTS public.additional_charges;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: additional_charges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.additional_charges (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    is_percentage boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.additional_charges OWNER TO postgres;

--
-- Name: additional_charges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.additional_charges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.additional_charges_id_seq OWNER TO postgres;

--
-- Name: additional_charges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.additional_charges_id_seq OWNED BY public.additional_charges.id;


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    address_line_1 character varying(255) NOT NULL,
    address_line_2 character varying(255),
    city character varying(255) NOT NULL,
    postal_code character varying(255) NOT NULL,
    region character varying(255),
    country character varying(255) DEFAULT 'Ελλάδα'::character varying NOT NULL,
    phone character varying(255) NOT NULL,
    is_default_shipping boolean DEFAULT false NOT NULL,
    is_default_billing boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.addresses_id_seq OWNER TO postgres;

--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: adoptable_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adoptable_items (
    id bigint NOT NULL,
    producer_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text NOT NULL,
    type character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'available'::character varying NOT NULL,
    main_image character varying(255),
    gallery_images json,
    attributes json,
    featured boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.adoptable_items OWNER TO postgres;

--
-- Name: adoptable_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adoptable_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.adoptable_items_id_seq OWNER TO postgres;

--
-- Name: adoptable_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adoptable_items_id_seq OWNED BY public.adoptable_items.id;


--
-- Name: adoption_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adoption_plans (
    id bigint NOT NULL,
    adoptable_item_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    duration_months integer NOT NULL,
    benefits json,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.adoption_plans OWNER TO postgres;

--
-- Name: adoption_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adoption_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.adoption_plans_id_seq OWNER TO postgres;

--
-- Name: adoption_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adoption_plans_id_seq OWNED BY public.adoption_plans.id;


--
-- Name: adoption_updates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adoption_updates (
    id bigint NOT NULL,
    adoption_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    images json,
    status character varying(255) DEFAULT 'published'::character varying NOT NULL,
    notify_adopter boolean DEFAULT true NOT NULL,
    published_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.adoption_updates OWNER TO postgres;

--
-- Name: adoption_updates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adoption_updates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.adoption_updates_id_seq OWNER TO postgres;

--
-- Name: adoption_updates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adoption_updates_id_seq OWNED BY public.adoption_updates.id;


--
-- Name: adoptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adoptions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    adoptable_item_id bigint NOT NULL,
    adoption_plan_id bigint NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    price_paid numeric(10,2) NOT NULL,
    payment_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    certificate_number character varying(255),
    certificate_file character varying(255),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.adoptions OWNER TO postgres;

--
-- Name: adoptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adoptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.adoptions_id_seq OWNER TO postgres;

--
-- Name: adoptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adoptions_id_seq OWNED BY public.adoptions.id;


--
-- Name: business_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_users (
    id bigint NOT NULL,
    tenant_id bigint,
    user_id bigint NOT NULL,
    business_name character varying(255) NOT NULL,
    business_type character varying(255) NOT NULL,
    tax_number character varying(255),
    registration_number character varying(255),
    industry character varying(255),
    annual_revenue numeric(15,2),
    employee_count integer,
    business_address json,
    billing_address json,
    contact_person character varying(255) NOT NULL,
    contact_phone character varying(255),
    contact_email character varying(255),
    website character varying(255),
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    verification_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    credit_limit numeric(10,2) DEFAULT '5000'::numeric NOT NULL,
    payment_terms character varying(255) DEFAULT 'net_30'::character varying NOT NULL,
    discount_tier character varying(255) DEFAULT 'bronze'::character varying NOT NULL,
    notes text,
    verified_at timestamp(0) without time zone,
    approved_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT business_users_business_type_check CHECK (((business_type)::text = ANY ((ARRAY['restaurant'::character varying, 'hotel'::character varying, 'catering'::character varying, 'retail'::character varying, 'wholesale'::character varying, 'distributor'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT business_users_discount_tier_check CHECK (((discount_tier)::text = ANY ((ARRAY['bronze'::character varying, 'silver'::character varying, 'gold'::character varying, 'platinum'::character varying])::text[]))),
    CONSTRAINT business_users_payment_terms_check CHECK (((payment_terms)::text = ANY ((ARRAY['immediate'::character varying, 'net_7'::character varying, 'net_15'::character varying, 'net_30'::character varying, 'net_45'::character varying, 'net_60'::character varying])::text[]))),
    CONSTRAINT business_users_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'suspended'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT business_users_verification_status_check CHECK (((verification_status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.business_users OWNER TO postgres;

--
-- Name: business_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.business_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.business_users_id_seq OWNER TO postgres;

--
-- Name: business_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.business_users_id_seq OWNED BY public.business_users.id;


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.businesses (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    business_name character varying(255) NOT NULL,
    tax_id character varying(255),
    tax_office character varying(255),
    description text,
    address character varying(255),
    city character varying(255),
    postal_code character varying(255),
    region character varying(255),
    website character varying(255),
    social_media json,
    bio text,
    verified boolean DEFAULT false NOT NULL,
    rating numeric(3,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    verification_date timestamp(0) without time zone,
    verification_notes text,
    logo character varying(255),
    country character varying(255)
);


ALTER TABLE public.businesses OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.businesses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.businesses_id_seq OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.businesses_id_seq OWNED BY public.businesses.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id bigint NOT NULL,
    cart_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2),
    attributes json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cart_items_id_seq OWNER TO postgres;

--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id bigint NOT NULL,
    user_id bigint,
    session_id character varying(255),
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carts_id_seq OWNER TO postgres;

--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255),
    slug character varying(255),
    description text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    tenant_id bigint
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_messages (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255),
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    accept_terms boolean DEFAULT false NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT contact_messages_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'read'::character varying, 'replied'::character varying, 'spam'::character varying])::text[])))
);


ALTER TABLE public.contact_messages OWNER TO postgres;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contact_messages_id_seq OWNER TO postgres;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contracts (
    id bigint NOT NULL,
    tenant_id bigint,
    business_user_id bigint NOT NULL,
    contract_number character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type character varying(255) DEFAULT 'supply'::character varying NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    start_date date NOT NULL,
    end_date date,
    auto_renewal boolean DEFAULT false NOT NULL,
    renewal_period character varying(255) DEFAULT 'yearly'::character varying NOT NULL,
    minimum_order_value numeric(10,2),
    maximum_order_value numeric(10,2),
    discount_percentage numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    payment_terms character varying(255) DEFAULT 'net_30'::character varying NOT NULL,
    delivery_terms character varying(255),
    terms_and_conditions text,
    special_conditions text,
    created_by bigint NOT NULL,
    approved_by bigint,
    signed_at timestamp(0) without time zone,
    activated_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT contracts_payment_terms_check CHECK (((payment_terms)::text = ANY ((ARRAY['immediate'::character varying, 'net_7'::character varying, 'net_15'::character varying, 'net_30'::character varying, 'net_45'::character varying, 'net_60'::character varying])::text[]))),
    CONSTRAINT contracts_renewal_period_check CHECK (((renewal_period)::text = ANY ((ARRAY['monthly'::character varying, 'quarterly'::character varying, 'yearly'::character varying])::text[]))),
    CONSTRAINT contracts_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'pending'::character varying, 'active'::character varying, 'expired'::character varying, 'terminated'::character varying, 'suspended'::character varying])::text[]))),
    CONSTRAINT contracts_type_check CHECK (((type)::text = ANY ((ARRAY['supply'::character varying, 'distribution'::character varying, 'exclusive'::character varying, 'volume'::character varying, 'seasonal'::character varying])::text[])))
);


ALTER TABLE public.contracts OWNER TO postgres;

--
-- Name: contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contracts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contracts_id_seq OWNER TO postgres;

--
-- Name: contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contracts_id_seq OWNED BY public.contracts.id;


--
-- Name: delivery_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_methods (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    max_weight_grams integer,
    max_length_cm integer,
    max_width_cm integer,
    max_height_cm integer,
    supports_cod boolean DEFAULT true NOT NULL,
    suitable_for_perishable boolean DEFAULT true NOT NULL,
    suitable_for_fragile boolean DEFAULT true NOT NULL
);


ALTER TABLE public.delivery_methods OWNER TO postgres;

--
-- Name: COLUMN delivery_methods.max_weight_grams; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.delivery_methods.max_weight_grams IS 'Max chargeable weight in grams';


--
-- Name: COLUMN delivery_methods.supports_cod; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.delivery_methods.supports_cod IS 'Supports Cash on Delivery';


--
-- Name: delivery_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.delivery_methods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.delivery_methods_id_seq OWNER TO postgres;

--
-- Name: delivery_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.delivery_methods_id_seq OWNED BY public.delivery_methods.id;


--
-- Name: extra_weight_charges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.extra_weight_charges (
    id bigint NOT NULL,
    shipping_zone_id bigint NOT NULL,
    delivery_method_id bigint NOT NULL,
    price_per_kg numeric(10,2) NOT NULL
);


ALTER TABLE public.extra_weight_charges OWNER TO postgres;

--
-- Name: extra_weight_charges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.extra_weight_charges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.extra_weight_charges_id_seq OWNER TO postgres;

--
-- Name: extra_weight_charges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.extra_weight_charges_id_seq OWNED BY public.extra_weight_charges.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.failed_jobs_id_seq OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.favorites_id_seq OWNER TO postgres;

--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: integration_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_logs (
    id bigint NOT NULL,
    service_name character varying(255) NOT NULL,
    operation character varying(255) NOT NULL,
    external_id character varying(255),
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL,
    request_data json,
    response_data json,
    status character varying(255) NOT NULL,
    error_message text,
    response_time_ms integer,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.integration_logs OWNER TO postgres;

--
-- Name: integration_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.integration_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.integration_logs_id_seq OWNER TO postgres;

--
-- Name: integration_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.integration_logs_id_seq OWNED BY public.integration_logs.id;


--
-- Name: integration_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_settings (
    id bigint NOT NULL,
    service character varying(255) NOT NULL,
    user_id bigint NOT NULL,
    tokens text NOT NULL,
    realm_id character varying(255),
    settings json,
    connected_at timestamp(0) without time zone,
    last_sync_at timestamp(0) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.integration_settings OWNER TO postgres;

--
-- Name: integration_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.integration_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.integration_settings_id_seq OWNER TO postgres;

--
-- Name: integration_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.integration_settings_id_seq OWNED BY public.integration_settings.id;


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id bigint NOT NULL,
    tenant_id bigint,
    invoice_id bigint NOT NULL,
    product_id bigint,
    description text NOT NULL,
    quantity numeric(10,3) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tax_rate numeric(5,4) DEFAULT '24'::numeric NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    product_sku character varying(255),
    product_name character varying(255),
    unit_of_measure character varying(255) DEFAULT 'τεμ.'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoice_items_id_seq OWNER TO postgres;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_items_id_seq OWNED BY public.invoice_items.id;


--
-- Name: invoice_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_payments (
    id bigint NOT NULL,
    tenant_id bigint,
    invoice_id bigint NOT NULL,
    payment_method character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'EUR'::character varying NOT NULL,
    payment_date timestamp(0) without time zone NOT NULL,
    transaction_id character varying(255),
    reference_number character varying(255),
    notes text,
    status character varying(255) DEFAULT 'completed'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT invoice_payments_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'bank_transfer'::character varying, 'credit_card'::character varying, 'stripe'::character varying, 'paypal'::character varying])::text[]))),
    CONSTRAINT invoice_payments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.invoice_payments OWNER TO postgres;

--
-- Name: invoice_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoice_payments_id_seq OWNER TO postgres;

--
-- Name: invoice_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_payments_id_seq OWNED BY public.invoice_payments.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id bigint NOT NULL,
    tenant_id bigint,
    order_id bigint NOT NULL,
    user_id bigint NOT NULL,
    invoice_number character varying(255) NOT NULL,
    invoice_type character varying(255) DEFAULT 'standard'::character varying NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    issue_date date NOT NULL,
    due_date date,
    paid_date date,
    subtotal numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying(3) DEFAULT 'EUR'::character varying NOT NULL,
    payment_terms integer,
    notes text,
    pdf_path character varying(255),
    pdf_url character varying(255),
    email_sent_at timestamp(0) without time zone,
    quickbooks_id character varying(255),
    xero_id character varying(255),
    created_by bigint,
    approved_by bigint,
    approved_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT invoices_invoice_type_check CHECK (((invoice_type)::text = ANY ((ARRAY['standard'::character varying, 'proforma'::character varying, 'credit_note'::character varying, 'debit_note'::character varying])::text[]))),
    CONSTRAINT invoices_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'sent'::character varying, 'viewed'::character varying, 'paid'::character varying, 'overdue'::character varying, 'cancelled'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoices_id_seq OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_permissions OWNER TO postgres;

--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_roles OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data json,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    producer_id bigint NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    business_id bigint,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    shipping_cost numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    shipping_address_id bigint NOT NULL,
    billing_address_id bigint NOT NULL,
    payment_method character varying(255) NOT NULL,
    payment_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tenant_id bigint,
    business_user_id bigint,
    quote_id bigint,
    contract_id bigint,
    order_type character varying(255) DEFAULT 'b2c'::character varying NOT NULL,
    payment_terms character varying(255),
    payment_due_date date,
    credit_used numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    b2b_notes text,
    shipping_provider character varying(255),
    tracking_number character varying(255),
    shipping_service_type character varying(255) DEFAULT 'standard'::character varying NOT NULL,
    actual_shipping_cost numeric(8,2),
    shipped_at timestamp(0) without time zone,
    delivered_at timestamp(0) without time zone,
    shipping_metadata json,
    quickbooks_invoice_id character varying(255),
    quickbooks_synced_at timestamp(0) without time zone,
    CONSTRAINT orders_order_type_check CHECK (((order_type)::text = ANY ((ARRAY['b2c'::character varying, 'b2b'::character varying])::text[]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT orders_payment_terms_check CHECK (((payment_terms)::text = ANY ((ARRAY['immediate'::character varying, 'net_7'::character varying, 'net_15'::character varying, 'net_30'::character varying, 'net_45'::character varying, 'net_60'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'shipped'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    transaction_id character varying(255),
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    payment_gateway character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    stripe_data json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    stripe_payment_intent_id character varying(255),
    currency character varying(3) DEFAULT 'EUR'::character varying NOT NULL,
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'succeeded'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: postal_code_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.postal_code_zones (
    id bigint NOT NULL,
    postal_code_prefix character varying(255) NOT NULL,
    shipping_zone_id bigint NOT NULL
);


ALTER TABLE public.postal_code_zones OWNER TO postgres;

--
-- Name: postal_code_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.postal_code_zones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.postal_code_zones_id_seq OWNER TO postgres;

--
-- Name: postal_code_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.postal_code_zones_id_seq OWNED BY public.postal_code_zones.id;


--
-- Name: producer_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_documents (
    id bigint NOT NULL,
    producer_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    type character varying(255),
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.producer_documents OWNER TO postgres;

--
-- Name: producer_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producer_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producer_documents_id_seq OWNER TO postgres;

--
-- Name: producer_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producer_documents_id_seq OWNED BY public.producer_documents.id;


--
-- Name: producer_environmental_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_environmental_stats (
    id bigint NOT NULL,
    producer_id bigint NOT NULL,
    distance numeric(10,2) NOT NULL,
    co2_saved numeric(10,2) NOT NULL,
    water_saved numeric(10,2) NOT NULL,
    packaging_saved numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.producer_environmental_stats OWNER TO postgres;

--
-- Name: COLUMN producer_environmental_stats.distance; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.producer_environmental_stats.distance IS 'Average distance in km';


--
-- Name: COLUMN producer_environmental_stats.co2_saved; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.producer_environmental_stats.co2_saved IS 'CO2 saved in kg per kg of product';


--
-- Name: COLUMN producer_environmental_stats.water_saved; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.producer_environmental_stats.water_saved IS 'Water saved in liters per kg of product';


--
-- Name: COLUMN producer_environmental_stats.packaging_saved; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.producer_environmental_stats.packaging_saved IS 'Packaging saved in kg per kg of product';


--
-- Name: producer_environmental_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producer_environmental_stats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producer_environmental_stats_id_seq OWNER TO postgres;

--
-- Name: producer_environmental_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producer_environmental_stats_id_seq OWNED BY public.producer_environmental_stats.id;


--
-- Name: producer_free_shipping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_free_shipping (
    id bigint NOT NULL,
    producer_id bigint NOT NULL,
    shipping_zone_id bigint,
    delivery_method_id bigint,
    free_shipping_threshold numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.producer_free_shipping OWNER TO postgres;

--
-- Name: producer_free_shipping_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producer_free_shipping_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producer_free_shipping_id_seq OWNER TO postgres;

--
-- Name: producer_free_shipping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producer_free_shipping_id_seq OWNED BY public.producer_free_shipping.id;


--
-- Name: producer_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_media (
    id bigint NOT NULL,
    producer_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT producer_media_type_check CHECK (((type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying])::text[])))
);


ALTER TABLE public.producer_media OWNER TO postgres;

--
-- Name: producer_media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producer_media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producer_media_id_seq OWNER TO postgres;

--
-- Name: producer_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producer_media_id_seq OWNED BY public.producer_media.id;


--
-- Name: producer_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    business_name character varying(200) NOT NULL,
    business_registration_number character varying(50),
    tax_number character varying(20) NOT NULL,
    description text,
    specialties json,
    location_address text NOT NULL,
    location_city character varying(100) NOT NULL,
    location_region character varying(100) NOT NULL,
    location_postal_code character varying(10) NOT NULL,
    location_lat numeric(10,8),
    location_lng numeric(11,8),
    website_url character varying(500),
    social_media json,
    farm_photos json,
    certification_documents json,
    verification_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    verification_notes text,
    trust_level character varying(255) DEFAULT 'new'::character varying NOT NULL,
    admin_notes text,
    verified_at timestamp(0) without time zone,
    verified_by bigint,
    payment_terms_days integer DEFAULT 7 NOT NULL,
    minimum_order_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    delivery_zones json,
    processing_time_days integer DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT producer_profiles_trust_level_check CHECK (((trust_level)::text = ANY ((ARRAY['new'::character varying, 'trusted'::character varying, 'premium'::character varying])::text[]))),
    CONSTRAINT producer_profiles_verification_status_check CHECK (((verification_status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.producer_profiles OWNER TO postgres;

--
-- Name: producer_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producer_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producer_profiles_id_seq OWNER TO postgres;

--
-- Name: producer_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producer_profiles_id_seq OWNED BY public.producer_profiles.id;


--
-- Name: producer_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_questions (
    id bigint NOT NULL,
    producer_id bigint NOT NULL,
    user_id bigint NOT NULL,
    question text NOT NULL,
    answer text,
    is_public boolean DEFAULT true NOT NULL,
    answered_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.producer_questions OWNER TO postgres;

--
-- Name: producer_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producer_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producer_questions_id_seq OWNER TO postgres;

--
-- Name: producer_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producer_questions_id_seq OWNED BY public.producer_questions.id;


--
-- Name: producer_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_reviews (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    producer_id bigint NOT NULL,
    rating smallint NOT NULL,
    title character varying(255),
    comment text,
    is_approved boolean DEFAULT false NOT NULL,
    is_verified_customer boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.producer_reviews OWNER TO postgres;

--
-- Name: COLUMN producer_reviews.rating; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.producer_reviews.rating IS 'Rating from 1-5';


--
-- Name: producer_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producer_reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producer_reviews_id_seq OWNER TO postgres;

--
-- Name: producer_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producer_reviews_id_seq OWNED BY public.producer_reviews.id;


--
-- Name: producer_shipping_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_shipping_methods (
    id bigint NOT NULL,
    producer_id bigint NOT NULL,
    delivery_method_id bigint NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL
);


ALTER TABLE public.producer_shipping_methods OWNER TO postgres;

--
-- Name: producer_shipping_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producer_shipping_methods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producer_shipping_methods_id_seq OWNER TO postgres;

--
-- Name: producer_shipping_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producer_shipping_methods_id_seq OWNED BY public.producer_shipping_methods.id;


--
-- Name: producer_shipping_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_shipping_rates (
    id bigint NOT NULL,
    producer_id bigint NOT NULL,
    shipping_zone_id bigint NOT NULL,
    weight_tier_id bigint NOT NULL,
    delivery_method_id bigint NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.producer_shipping_rates OWNER TO postgres;

--
-- Name: producer_shipping_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producer_shipping_rates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producer_shipping_rates_id_seq OWNER TO postgres;

--
-- Name: producer_shipping_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producer_shipping_rates_id_seq OWNED BY public.producer_shipping_rates.id;


--
-- Name: producers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producers (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    business_name character varying(255) NOT NULL,
    tax_id character varying(255),
    tax_office character varying(255),
    description text,
    address character varying(255),
    city character varying(255),
    postal_code character varying(255),
    region character varying(255),
    logo character varying(255),
    cover_image character varying(255),
    website character varying(255),
    social_media json,
    bio text,
    verified boolean DEFAULT false NOT NULL,
    rating numeric(3,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tenant_id bigint,
    uses_custom_shipping_rates boolean DEFAULT false NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    map_description text
);


ALTER TABLE public.producers OWNER TO postgres;

--
-- Name: COLUMN producers.latitude; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.producers.latitude IS 'Γεωγραφικό πλάτος';


--
-- Name: COLUMN producers.longitude; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.producers.longitude IS 'Γεωγραφικό μήκος';


--
-- Name: COLUMN producers.map_description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.producers.map_description IS 'Περιγραφή για τον χάρτη';


--
-- Name: producers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producers_id_seq OWNER TO postgres;

--
-- Name: producers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producers_id_seq OWNED BY public.producers.id;


--
-- Name: product_attribute_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_attribute_values (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    attribute_id bigint NOT NULL,
    value text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.product_attribute_values OWNER TO postgres;

--
-- Name: product_attribute_values_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_attribute_values_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_attribute_values_id_seq OWNER TO postgres;

--
-- Name: product_attribute_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_attribute_values_id_seq OWNED BY public.product_attribute_values.id;


--
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_attributes (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'text'::character varying NOT NULL,
    options json,
    description text,
    is_filterable boolean DEFAULT true NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.product_attributes OWNER TO postgres;

--
-- Name: product_attributes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_attributes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_attributes_id_seq OWNER TO postgres;

--
-- Name: product_attributes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_attributes_id_seq OWNED BY public.product_attributes.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_categories (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    parent_id bigint,
    description text,
    image character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    type character varying(255) DEFAULT 'product'::character varying NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    CONSTRAINT product_categories_type_check CHECK (((type)::text = ANY ((ARRAY['product'::character varying, 'functional'::character varying])::text[])))
);


ALTER TABLE public.product_categories OWNER TO postgres;

--
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_categories_id_seq OWNER TO postgres;

--
-- Name: product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_categories_id_seq OWNED BY public.product_categories.id;


--
-- Name: product_category_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_category_relations (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    category_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.product_category_relations OWNER TO postgres;

--
-- Name: product_category_relations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_category_relations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_category_relations_id_seq OWNER TO postgres;

--
-- Name: product_category_relations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_category_relations_id_seq OWNED BY public.product_category_relations.id;


--
-- Name: product_cost_breakdowns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_cost_breakdowns (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    producer_cost numeric(10,2),
    packaging_cost numeric(10,2),
    producer_profit_target numeric(10,2),
    platform_fee_percentage numeric(5,2),
    shipping_estimate numeric(10,2),
    taxes_estimate numeric(10,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.product_cost_breakdowns OWNER TO postgres;

--
-- Name: COLUMN product_cost_breakdowns.producer_cost; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.product_cost_breakdowns.producer_cost IS 'Production cost for the producer';


--
-- Name: COLUMN product_cost_breakdowns.packaging_cost; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.product_cost_breakdowns.packaging_cost IS 'Cost of packaging';


--
-- Name: COLUMN product_cost_breakdowns.producer_profit_target; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.product_cost_breakdowns.producer_profit_target IS 'Target profit for the producer';


--
-- Name: COLUMN product_cost_breakdowns.platform_fee_percentage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.product_cost_breakdowns.platform_fee_percentage IS 'Platform fee percentage';


--
-- Name: COLUMN product_cost_breakdowns.shipping_estimate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.product_cost_breakdowns.shipping_estimate IS 'Estimated shipping cost';


--
-- Name: COLUMN product_cost_breakdowns.taxes_estimate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.product_cost_breakdowns.taxes_estimate IS 'Estimated taxes';


--
-- Name: product_cost_breakdowns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_cost_breakdowns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_cost_breakdowns_id_seq OWNER TO postgres;

--
-- Name: product_cost_breakdowns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_cost_breakdowns_id_seq OWNED BY public.product_cost_breakdowns.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    image_path character varying(255) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    alt_text character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_images_id_seq OWNER TO postgres;

--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: product_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_questions (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    user_id bigint NOT NULL,
    question text NOT NULL,
    answer text,
    answered_by_producer_id bigint,
    is_public boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.product_questions OWNER TO postgres;

--
-- Name: product_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_questions_id_seq OWNER TO postgres;

--
-- Name: product_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_questions_id_seq OWNED BY public.product_questions.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    producer_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text NOT NULL,
    short_description character varying(255),
    price numeric(10,2) NOT NULL,
    discount_price numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    sku character varying(255),
    weight_grams integer,
    dimensions json,
    main_image character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_seasonal boolean DEFAULT false NOT NULL,
    season_start date,
    season_end date,
    is_limited_edition boolean DEFAULT false NOT NULL,
    limited_quantity integer,
    allow_wishlist_notifications boolean DEFAULT true NOT NULL,
    attributes json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tenant_id bigint,
    b2b_available boolean DEFAULT false NOT NULL,
    wholesale_price numeric(10,2),
    min_order_quantity integer DEFAULT 1 NOT NULL,
    max_order_quantity integer,
    bulk_discount_threshold numeric(10,2),
    bulk_discount_percentage numeric(5,2),
    b2b_description text,
    b2b_specifications json,
    category_id integer,
    length_cm integer,
    width_cm integer,
    height_cm integer,
    is_perishable boolean DEFAULT false NOT NULL,
    is_fragile boolean DEFAULT false NOT NULL,
    seasonality json,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    is_organic boolean DEFAULT false NOT NULL,
    is_vegan boolean DEFAULT false NOT NULL,
    is_gluten_free boolean DEFAULT false NOT NULL,
    weight numeric(10,2),
    stock_quantity integer DEFAULT 0 NOT NULL,
    quickbooks_item_id character varying(255),
    quickbooks_synced_at timestamp(0) without time zone,
    CONSTRAINT products_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: quickbooks_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quickbooks_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    company_id character varying(255) NOT NULL,
    expires_at timestamp(0) without time zone NOT NULL,
    company_info json,
    last_sync timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.quickbooks_tokens OWNER TO postgres;

--
-- Name: quickbooks_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quickbooks_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quickbooks_tokens_id_seq OWNER TO postgres;

--
-- Name: quickbooks_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quickbooks_tokens_id_seq OWNED BY public.quickbooks_tokens.id;


--
-- Name: quote_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote_items (
    id bigint NOT NULL,
    quote_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    discount_percentage numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.quote_items OWNER TO postgres;

--
-- Name: quote_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quote_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quote_items_id_seq OWNER TO postgres;

--
-- Name: quote_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quote_items_id_seq OWNED BY public.quote_items.id;


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotes (
    id bigint NOT NULL,
    tenant_id bigint,
    business_user_id bigint NOT NULL,
    quote_number character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    subtotal numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    discount_percentage numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying(3) DEFAULT 'EUR'::character varying NOT NULL,
    valid_until timestamp(0) without time zone,
    terms_and_conditions text,
    notes text,
    created_by bigint NOT NULL,
    approved_by bigint,
    approved_at timestamp(0) without time zone,
    converted_to_order_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT quotes_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'sent'::character varying, 'viewed'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'expired'::character varying, 'converted'::character varying])::text[])))
);


ALTER TABLE public.quotes OWNER TO postgres;

--
-- Name: quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quotes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quotes_id_seq OWNER TO postgres;

--
-- Name: quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quotes_id_seq OWNED BY public.quotes.id;


--
-- Name: recommendation_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recommendation_logs (
    id bigint NOT NULL,
    user_id bigint,
    product_ids json NOT NULL,
    algorithm character varying(50) NOT NULL,
    context character varying(100),
    metadata json,
    served_at timestamp(0) without time zone NOT NULL,
    clicked_at timestamp(0) without time zone,
    clicked_product_id integer,
    position_clicked integer,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.recommendation_logs OWNER TO postgres;

--
-- Name: recommendation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recommendation_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.recommendation_logs_id_seq OWNER TO postgres;

--
-- Name: recommendation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recommendation_logs_id_seq OWNED BY public.recommendation_logs.id;


--
-- Name: revenue_shares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revenue_shares (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    order_id bigint,
    transaction_type character varying(255) DEFAULT 'order'::character varying NOT NULL,
    gross_amount numeric(10,2) NOT NULL,
    commission_rate numeric(5,2) NOT NULL,
    commission_amount numeric(10,2) NOT NULL,
    net_amount numeric(10,2) NOT NULL,
    platform_fee numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    payment_processor_fee numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    processed_at timestamp(0) without time zone,
    payout_date timestamp(0) without time zone,
    payout_reference character varying(255),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT revenue_shares_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'calculated'::character varying, 'approved'::character varying, 'paid'::character varying, 'disputed'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT revenue_shares_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['order'::character varying, 'subscription'::character varying, 'setup_fee'::character varying, 'refund'::character varying, 'chargeback'::character varying])::text[])))
);


ALTER TABLE public.revenue_shares OWNER TO postgres;

--
-- Name: revenue_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.revenue_shares_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.revenue_shares_id_seq OWNER TO postgres;

--
-- Name: revenue_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.revenue_shares_id_seq OWNED BY public.revenue_shares.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    rating smallint NOT NULL,
    title character varying(255),
    comment text,
    is_approved boolean DEFAULT false NOT NULL,
    is_verified_purchase boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tenant_id bigint
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: COLUMN reviews.rating; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reviews.rating IS 'Rating from 1-5';


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.role_has_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id bigint NOT NULL,
    key character varying(255) NOT NULL,
    value json NOT NULL,
    type character varying(255) NOT NULL,
    "group" character varying(255) DEFAULT 'general'::character varying NOT NULL,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: shipping_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_rates (
    id bigint NOT NULL,
    shipping_zone_id bigint NOT NULL,
    weight_tier_id bigint NOT NULL,
    delivery_method_id bigint NOT NULL,
    price numeric(10,2) NOT NULL,
    multi_producer_discount numeric(5,2),
    min_producers_for_discount smallint
);


ALTER TABLE public.shipping_rates OWNER TO postgres;

--
-- Name: COLUMN shipping_rates.multi_producer_discount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.shipping_rates.multi_producer_discount IS 'Discount percentage (0-100) to apply when multiple producers are in the same order';


--
-- Name: COLUMN shipping_rates.min_producers_for_discount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.shipping_rates.min_producers_for_discount IS 'Minimum number of producers required in order to apply the discount';


--
-- Name: shipping_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shipping_rates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.shipping_rates_id_seq OWNER TO postgres;

--
-- Name: shipping_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shipping_rates_id_seq OWNED BY public.shipping_rates.id;


--
-- Name: shipping_tracking_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_tracking_events (
    id bigint NOT NULL,
    tracking_number character varying(255) NOT NULL,
    provider character varying(255) NOT NULL,
    event_type character varying(255) NOT NULL,
    event_description character varying(255) NOT NULL,
    location character varying(255),
    event_timestamp timestamp(0) without time zone NOT NULL,
    raw_data json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.shipping_tracking_events OWNER TO postgres;

--
-- Name: shipping_tracking_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shipping_tracking_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.shipping_tracking_events_id_seq OWNER TO postgres;

--
-- Name: shipping_tracking_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shipping_tracking_events_id_seq OWNED BY public.shipping_tracking_events.id;


--
-- Name: shipping_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_zones (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    geojson json,
    color character varying(20),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.shipping_zones OWNER TO postgres;

--
-- Name: shipping_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shipping_zones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.shipping_zones_id_seq OWNER TO postgres;

--
-- Name: shipping_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shipping_zones_id_seq OWNED BY public.shipping_zones.id;


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    target_type character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    billing_cycle character varying(255) NOT NULL,
    duration_months integer DEFAULT 1 NOT NULL,
    commission_rate numeric(5,2),
    features json,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscription_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscription_plans_id_seq OWNER TO postgres;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id bigint NOT NULL,
    plan_id bigint NOT NULL,
    subscribable_type character varying(255) NOT NULL,
    subscribable_id bigint NOT NULL,
    status character varying(255) NOT NULL,
    start_date timestamp(0) without time zone NOT NULL,
    end_date timestamp(0) without time zone,
    auto_renew boolean DEFAULT true NOT NULL,
    payment_id bigint,
    last_payment_date timestamp(0) without time zone,
    next_payment_date timestamp(0) without time zone,
    cancellation_reason text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscriptions_id_seq OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: tenant_themes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_themes (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    primary_color character varying(7) DEFAULT '#16a34a'::character varying NOT NULL,
    secondary_color character varying(7) DEFAULT '#059669'::character varying NOT NULL,
    accent_color character varying(7) DEFAULT '#10b981'::character varying NOT NULL,
    background_color character varying(7) DEFAULT '#ffffff'::character varying NOT NULL,
    text_color character varying(7) DEFAULT '#1f2937'::character varying NOT NULL,
    font_family character varying(255) DEFAULT 'Inter'::character varying NOT NULL,
    logo_url character varying(255),
    favicon_url character varying(255),
    custom_css text,
    settings json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.tenant_themes OWNER TO postgres;

--
-- Name: tenant_themes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tenant_themes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tenant_themes_id_seq OWNER TO postgres;

--
-- Name: tenant_themes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tenant_themes_id_seq OWNED BY public.tenant_themes.id;


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    domain character varying(255),
    subdomain character varying(255) NOT NULL,
    plan character varying(255) DEFAULT 'basic'::character varying NOT NULL,
    status character varying(255) DEFAULT 'trial'::character varying NOT NULL,
    owner_id bigint NOT NULL,
    settings json,
    subscription_expires_at timestamp(0) without time zone,
    trial_ends_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT tenants_plan_check CHECK (((plan)::text = ANY ((ARRAY['basic'::character varying, 'premium'::character varying, 'enterprise'::character varying])::text[]))),
    CONSTRAINT tenants_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying, 'trial'::character varying])::text[])))
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tenants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tenants_id_seq OWNER TO postgres;

--
-- Name: tenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tenants_id_seq OWNED BY public.tenants.id;


--
-- Name: user_behavior_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_behavior_events (
    id bigint NOT NULL,
    user_id bigint,
    session_id character varying(100) NOT NULL,
    event_type character varying(255) NOT NULL,
    product_id bigint,
    category_id bigint,
    producer_id bigint,
    search_query character varying(500),
    page_url character varying(1000),
    referrer character varying(1000),
    user_agent character varying(500),
    ip_address inet,
    device_type character varying(50),
    browser character varying(100),
    os character varying(100),
    metadata json,
    created_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT user_behavior_events_event_type_check CHECK (((event_type)::text = ANY ((ARRAY['product_view'::character varying, 'category_view'::character varying, 'producer_view'::character varying, 'search'::character varying, 'search_click'::character varying, 'add_to_cart'::character varying, 'remove_from_cart'::character varying, 'add_to_wishlist'::character varying, 'remove_from_wishlist'::character varying, 'purchase'::character varying, 'page_view'::character varying, 'click'::character varying, 'scroll'::character varying, 'time_on_page'::character varying])::text[])))
);


ALTER TABLE public.user_behavior_events OWNER TO postgres;

--
-- Name: user_behavior_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_behavior_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_behavior_events_id_seq OWNER TO postgres;

--
-- Name: user_behavior_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_behavior_events_id_seq OWNED BY public.user_behavior_events.id;


--
-- Name: user_preference_updates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_preference_updates (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    action character varying(255) NOT NULL,
    weight numeric(3,2) DEFAULT '1'::numeric NOT NULL,
    context json,
    created_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT user_preference_updates_action_check CHECK (((action)::text = ANY ((ARRAY['purchase'::character varying, 'view'::character varying, 'add_to_cart'::character varying, 'add_to_wishlist'::character varying, 'search_click'::character varying])::text[])))
);


ALTER TABLE public.user_preference_updates OWNER TO postgres;

--
-- Name: user_preference_updates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_preference_updates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_preference_updates_id_seq OWNER TO postgres;

--
-- Name: user_preference_updates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_preference_updates_id_seq OWNED BY public.user_preference_updates.id;


--
-- Name: user_product_interactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_product_interactions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    rating numeric(3,2) DEFAULT '1'::numeric NOT NULL,
    interaction_count integer DEFAULT 1 NOT NULL,
    last_interaction timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.user_product_interactions OWNER TO postgres;

--
-- Name: user_product_interactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_product_interactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_product_interactions_id_seq OWNER TO postgres;

--
-- Name: user_product_interactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_product_interactions_id_seq OWNED BY public.user_product_interactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    phone character varying(255),
    role character varying(255) DEFAULT 'consumer'::character varying NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tenant_id bigint,
    is_active boolean DEFAULT true NOT NULL,
    stripe_customer_id character varying(255),
    quickbooks_customer_id character varying(255),
    quickbooks_synced_at timestamp(0) without time zone,
    google_id character varying(255),
    avatar character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['consumer'::character varying, 'producer'::character varying, 'admin'::character varying, 'business_user'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: weight_tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weight_tiers (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    min_weight_grams integer NOT NULL,
    max_weight_grams integer NOT NULL,
    description character varying(255)
);


ALTER TABLE public.weight_tiers OWNER TO postgres;

--
-- Name: weight_tiers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weight_tiers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.weight_tiers_id_seq OWNER TO postgres;

--
-- Name: weight_tiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weight_tiers_id_seq OWNED BY public.weight_tiers.id;


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wishlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.wishlists_id_seq OWNER TO postgres;

--
-- Name: wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wishlists_id_seq OWNED BY public.wishlists.id;


--
-- Name: additional_charges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.additional_charges ALTER COLUMN id SET DEFAULT nextval('public.additional_charges_id_seq'::regclass);


--
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: adoptable_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptable_items ALTER COLUMN id SET DEFAULT nextval('public.adoptable_items_id_seq'::regclass);


--
-- Name: adoption_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoption_plans ALTER COLUMN id SET DEFAULT nextval('public.adoption_plans_id_seq'::regclass);


--
-- Name: adoption_updates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoption_updates ALTER COLUMN id SET DEFAULT nextval('public.adoption_updates_id_seq'::regclass);


--
-- Name: adoptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions ALTER COLUMN id SET DEFAULT nextval('public.adoptions_id_seq'::regclass);


--
-- Name: business_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_users ALTER COLUMN id SET DEFAULT nextval('public.business_users_id_seq'::regclass);


--
-- Name: businesses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses ALTER COLUMN id SET DEFAULT nextval('public.businesses_id_seq'::regclass);


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- Name: contracts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts ALTER COLUMN id SET DEFAULT nextval('public.contracts_id_seq'::regclass);


--
-- Name: delivery_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_methods ALTER COLUMN id SET DEFAULT nextval('public.delivery_methods_id_seq'::regclass);


--
-- Name: extra_weight_charges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extra_weight_charges ALTER COLUMN id SET DEFAULT nextval('public.extra_weight_charges_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: integration_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_logs ALTER COLUMN id SET DEFAULT nextval('public.integration_logs_id_seq'::regclass);


--
-- Name: integration_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_settings ALTER COLUMN id SET DEFAULT nextval('public.integration_settings_id_seq'::regclass);


--
-- Name: invoice_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items ALTER COLUMN id SET DEFAULT nextval('public.invoice_items_id_seq'::regclass);


--
-- Name: invoice_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_payments ALTER COLUMN id SET DEFAULT nextval('public.invoice_payments_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: postal_code_zones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postal_code_zones ALTER COLUMN id SET DEFAULT nextval('public.postal_code_zones_id_seq'::regclass);


--
-- Name: producer_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_documents ALTER COLUMN id SET DEFAULT nextval('public.producer_documents_id_seq'::regclass);


--
-- Name: producer_environmental_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_environmental_stats ALTER COLUMN id SET DEFAULT nextval('public.producer_environmental_stats_id_seq'::regclass);


--
-- Name: producer_free_shipping id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_free_shipping ALTER COLUMN id SET DEFAULT nextval('public.producer_free_shipping_id_seq'::regclass);


--
-- Name: producer_media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_media ALTER COLUMN id SET DEFAULT nextval('public.producer_media_id_seq'::regclass);


--
-- Name: producer_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_profiles ALTER COLUMN id SET DEFAULT nextval('public.producer_profiles_id_seq'::regclass);


--
-- Name: producer_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_questions ALTER COLUMN id SET DEFAULT nextval('public.producer_questions_id_seq'::regclass);


--
-- Name: producer_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_reviews ALTER COLUMN id SET DEFAULT nextval('public.producer_reviews_id_seq'::regclass);


--
-- Name: producer_shipping_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_methods ALTER COLUMN id SET DEFAULT nextval('public.producer_shipping_methods_id_seq'::regclass);


--
-- Name: producer_shipping_rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_rates ALTER COLUMN id SET DEFAULT nextval('public.producer_shipping_rates_id_seq'::regclass);


--
-- Name: producers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producers ALTER COLUMN id SET DEFAULT nextval('public.producers_id_seq'::regclass);


--
-- Name: product_attribute_values id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attribute_values ALTER COLUMN id SET DEFAULT nextval('public.product_attribute_values_id_seq'::regclass);


--
-- Name: product_attributes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes ALTER COLUMN id SET DEFAULT nextval('public.product_attributes_id_seq'::regclass);


--
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq'::regclass);


--
-- Name: product_category_relations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_relations ALTER COLUMN id SET DEFAULT nextval('public.product_category_relations_id_seq'::regclass);


--
-- Name: product_cost_breakdowns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_cost_breakdowns ALTER COLUMN id SET DEFAULT nextval('public.product_cost_breakdowns_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: product_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_questions ALTER COLUMN id SET DEFAULT nextval('public.product_questions_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: quickbooks_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quickbooks_tokens ALTER COLUMN id SET DEFAULT nextval('public.quickbooks_tokens_id_seq'::regclass);


--
-- Name: quote_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_items ALTER COLUMN id SET DEFAULT nextval('public.quote_items_id_seq'::regclass);


--
-- Name: quotes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes ALTER COLUMN id SET DEFAULT nextval('public.quotes_id_seq'::regclass);


--
-- Name: recommendation_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendation_logs ALTER COLUMN id SET DEFAULT nextval('public.recommendation_logs_id_seq'::regclass);


--
-- Name: revenue_shares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_shares ALTER COLUMN id SET DEFAULT nextval('public.revenue_shares_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: shipping_rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_rates ALTER COLUMN id SET DEFAULT nextval('public.shipping_rates_id_seq'::regclass);


--
-- Name: shipping_tracking_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_tracking_events ALTER COLUMN id SET DEFAULT nextval('public.shipping_tracking_events_id_seq'::regclass);


--
-- Name: shipping_zones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_zones ALTER COLUMN id SET DEFAULT nextval('public.shipping_zones_id_seq'::regclass);


--
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: tenant_themes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_themes ALTER COLUMN id SET DEFAULT nextval('public.tenant_themes_id_seq'::regclass);


--
-- Name: tenants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants ALTER COLUMN id SET DEFAULT nextval('public.tenants_id_seq'::regclass);


--
-- Name: user_behavior_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_behavior_events ALTER COLUMN id SET DEFAULT nextval('public.user_behavior_events_id_seq'::regclass);


--
-- Name: user_preference_updates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preference_updates ALTER COLUMN id SET DEFAULT nextval('public.user_preference_updates_id_seq'::regclass);


--
-- Name: user_product_interactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_product_interactions ALTER COLUMN id SET DEFAULT nextval('public.user_product_interactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: weight_tiers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_tiers ALTER COLUMN id SET DEFAULT nextval('public.weight_tiers_id_seq'::regclass);


--
-- Name: wishlists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists ALTER COLUMN id SET DEFAULT nextval('public.wishlists_id_seq'::regclass);


--
-- Data for Name: additional_charges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.additional_charges (id, code, name, description, price, is_percentage, is_active) FROM stdin;
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, user_id, name, address_line_1, address_line_2, city, postal_code, region, country, phone, is_default_shipping, is_default_billing, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: adoptable_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adoptable_items (id, producer_id, name, slug, description, type, location, status, main_image, gallery_images, attributes, featured, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: adoption_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adoption_plans (id, adoptable_item_id, name, description, price, duration_months, benefits, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: adoption_updates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adoption_updates (id, adoption_id, title, content, images, status, notify_adopter, published_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: adoptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adoptions (id, user_id, adoptable_item_id, adoption_plan_id, status, start_date, end_date, price_paid, payment_status, certificate_number, certificate_file, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: business_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_users (id, tenant_id, user_id, business_name, business_type, tax_number, registration_number, industry, annual_revenue, employee_count, business_address, billing_address, contact_person, contact_phone, contact_email, website, status, verification_status, credit_limit, payment_terms, discount_tier, notes, verified_at, approved_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.businesses (id, user_id, business_name, tax_id, tax_office, description, address, city, postal_code, region, website, social_media, bio, verified, rating, created_at, updated_at, verification_date, verification_notes, logo, country) FROM stdin;
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
dixis_marketplace_cache_dixis_marketplace_cache_:products:06ae3330bf457f07cfd8684ae50f65e8	a:13:{s:12:"current_page";i:1;s:4:"data";a:3:{i:0;a:50:{s:2:"id";i:65;s:11:"producer_id";i:5;s:4:"name";s:39:"Πορτοκάλια Αργολίδας";s:4:"slug";s:20:"portokalia-argolidas";s:11:"description";s:163:"Φρέσκα πορτοκάλια από τους κήπους της Αργολίδας. Ζουμερά και γλυκά, πλούσια σε βιταμίνη C.";s:17:"short_description";s:64:"Φρέσκα πορτοκάλια από την Αργολίδα";s:5:"price";d:3.2;s:14:"discount_price";N;s:5:"stock";i:200;s:3:"sku";s:6:"SKU-65";s:12:"weight_grams";i:1000;s:10:"dimensions";N;s:10:"main_image";s:78:"https://images.unsplash.com/photo-1547514701-42782101795e?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:14;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:200;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:14;s:4:"name";s:31:"Φρούτα & Λαχανικά";s:4:"slug";s:15:"frouta-laxanika";s:11:"description";s:49:"Φρέσκα φρούτα και λαχανικά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:1;a:50:{s:2:"id";i:6;s:11:"producer_id";i:5;s:4:"name";s:52:"Πορτοκάλια Βαλέντσια Κρήτης";s:4:"slug";s:27:"portokalia-balentsia-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:2.5;s:14:"discount_price";N;s:5:"stock";i:193;s:3:"sku";s:5:"SKU-6";s:12:"weight_grams";i:1190;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:193;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:2;a:50:{s:2:"id";i:62;s:11:"producer_id";i:4;s:4:"name";s:38:"Φέτα ΠΟΠ Δωδεκανήσου";s:4:"slug";s:20:"feta-pop-dodekanisoy";s:11:"description";s:181:"Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα. Κρεμώδης υφή, αλμυρή γεύση, ιδανική για ελληνική σαλάτα.";s:17:"short_description";s:77:"Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα";s:5:"price";d:14.2;s:14:"discount_price";N;s:5:"stock";i:90;s:3:"sku";s:6:"SKU-62";s:12:"weight_grams";i:400;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:12;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:90;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:4;s:7:"user_id";i:4;s:13:"business_name";s:33:"Τυροκομείο Κρήτης";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:108:"Παραδοσιακά κρητικά τυριά από κατσικίσιο και πρόβειο γάλα.";s:7:"address";s:22:"Χανιά, Κρήτη";s:4:"city";s:10:"Χανιά";s:11:"postal_code";N;s:6:"region";s:10:"Κρήτη";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:125:"Τυροκομείο που διατηρεί τις παραδοσιακές συνταγές της κρητικής γης.";s:8:"verified";b:1;s:6:"rating";s:4:"4.70";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:12;s:4:"name";s:39:"Τυριά & Γαλακτοκομικά";s:4:"slug";s:19:"tyria-galaktokomika";s:11:"description";s:61:"Τυριά και γαλακτοκομικά προϊόντα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}}s:14:"first_page_url";s:44:"http://localhost:8000/api/v1/products?page=1";s:4:"from";i:1;s:9:"last_page";i:22;s:13:"last_page_url";s:45:"http://localhost:8000/api/v1/products?page=22";s:5:"links";a:15:{i:0;a:3:{s:3:"url";N;s:5:"label";s:16:"&laquo; Previous";s:6:"active";b:0;}i:1;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=1";s:5:"label";s:1:"1";s:6:"active";b:1;}i:2;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=2";s:5:"label";s:1:"2";s:6:"active";b:0;}i:3;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=3";s:5:"label";s:1:"3";s:6:"active";b:0;}i:4;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=4";s:5:"label";s:1:"4";s:6:"active";b:0;}i:5;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=5";s:5:"label";s:1:"5";s:6:"active";b:0;}i:6;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=6";s:5:"label";s:1:"6";s:6:"active";b:0;}i:7;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=7";s:5:"label";s:1:"7";s:6:"active";b:0;}i:8;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=8";s:5:"label";s:1:"8";s:6:"active";b:0;}i:9;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=9";s:5:"label";s:1:"9";s:6:"active";b:0;}i:10;a:3:{s:3:"url";s:45:"http://localhost:8000/api/v1/products?page=10";s:5:"label";s:2:"10";s:6:"active";b:0;}i:11;a:3:{s:3:"url";N;s:5:"label";s:3:"...";s:6:"active";b:0;}i:12;a:3:{s:3:"url";s:45:"http://localhost:8000/api/v1/products?page=21";s:5:"label";s:2:"21";s:6:"active";b:0;}i:13;a:3:{s:3:"url";s:45:"http://localhost:8000/api/v1/products?page=22";s:5:"label";s:2:"22";s:6:"active";b:0;}i:14;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=2";s:5:"label";s:12:"Next &raquo;";s:6:"active";b:0;}}s:13:"next_page_url";s:44:"http://localhost:8000/api/v1/products?page=2";s:4:"path";s:37:"http://localhost:8000/api/v1/products";s:8:"per_page";i:3;s:13:"prev_page_url";N;s:2:"to";i:3;s:5:"total";i:65;}	1753388000
dixis_marketplace_cache_dixis_marketplace_cache_:products:40cd750bba9870f18aada2478b24840a	a:13:{s:12:"current_page";i:1;s:4:"data";a:20:{i:0;a:50:{s:2:"id";i:65;s:11:"producer_id";i:5;s:4:"name";s:39:"Πορτοκάλια Αργολίδας";s:4:"slug";s:20:"portokalia-argolidas";s:11:"description";s:163:"Φρέσκα πορτοκάλια από τους κήπους της Αργολίδας. Ζουμερά και γλυκά, πλούσια σε βιταμίνη C.";s:17:"short_description";s:64:"Φρέσκα πορτοκάλια από την Αργολίδα";s:5:"price";d:3.2;s:14:"discount_price";N;s:5:"stock";i:200;s:3:"sku";s:6:"SKU-65";s:12:"weight_grams";i:1000;s:10:"dimensions";N;s:10:"main_image";s:78:"https://images.unsplash.com/photo-1547514701-42782101795e?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:14;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:200;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:14;s:4:"name";s:31:"Φρούτα & Λαχανικά";s:4:"slug";s:15:"frouta-laxanika";s:11:"description";s:49:"Φρέσκα φρούτα και λαχανικά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:1;a:50:{s:2:"id";i:6;s:11:"producer_id";i:5;s:4:"name";s:52:"Πορτοκάλια Βαλέντσια Κρήτης";s:4:"slug";s:27:"portokalia-balentsia-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:2.5;s:14:"discount_price";N;s:5:"stock";i:193;s:3:"sku";s:5:"SKU-6";s:12:"weight_grams";i:1190;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:193;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:2;a:50:{s:2:"id";i:62;s:11:"producer_id";i:4;s:4:"name";s:38:"Φέτα ΠΟΠ Δωδεκανήσου";s:4:"slug";s:20:"feta-pop-dodekanisoy";s:11:"description";s:181:"Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα. Κρεμώδης υφή, αλμυρή γεύση, ιδανική για ελληνική σαλάτα.";s:17:"short_description";s:77:"Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα";s:5:"price";d:14.2;s:14:"discount_price";N;s:5:"stock";i:90;s:3:"sku";s:6:"SKU-62";s:12:"weight_grams";i:400;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:12;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:90;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:4;s:7:"user_id";i:4;s:13:"business_name";s:33:"Τυροκομείο Κρήτης";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:108:"Παραδοσιακά κρητικά τυριά από κατσικίσιο και πρόβειο γάλα.";s:7:"address";s:22:"Χανιά, Κρήτη";s:4:"city";s:10:"Χανιά";s:11:"postal_code";N;s:6:"region";s:10:"Κρήτη";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:125:"Τυροκομείο που διατηρεί τις παραδοσιακές συνταγές της κρητικής γης.";s:8:"verified";b:1;s:6:"rating";s:4:"4.70";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:12;s:4:"name";s:39:"Τυριά & Γαλακτοκομικά";s:4:"slug";s:19:"tyria-galaktokomika";s:11:"description";s:61:"Τυριά και γαλακτοκομικά προϊόντα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:3;a:50:{s:2:"id";i:56;s:11:"producer_id";i:1;s:4:"name";s:62:"Εξτραπάρθενο Ελαιόλαδο Κορωνέικη";s:4:"slug";s:32:"extraparteno-elaiolado-koroneiki";s:11:"description";s:250:"Εξαιρετικής ποιότητας εξτραπάρθενο ελαιόλαδο από ελιές Κορωνέικη. Ψυχρή εκχύλιση, χαμηλή οξύτητα 0.2%. Ιδανικό για σαλάτες και μαγείρεμα.";s:17:"short_description";s:91:"Εξτραπάρθενο ελαιόλαδο Κορωνέικη, ψυχρή εκχύλιση";s:5:"price";d:12.5;s:14:"discount_price";N;s:5:"stock";i:150;s:3:"sku";s:6:"SKU-56";s:12:"weight_grams";i:500;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:9;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:150;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:9;s:4:"name";s:31:"Ελαιόλαδο & Λάδια";s:4:"slug";s:15:"elaiolado-ladia";s:11:"description";s:72:"Ποικιλία ελαιολάδων και φυτικών ελαίων";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:4;a:50:{s:2:"id";i:44;s:11:"producer_id";i:1;s:4:"name";s:35:"Φορμαέλλα Αράχωβας";s:4:"slug";s:19:"formaella-arakhovas";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:13.8;s:14:"discount_price";N;s:5:"stock";i:172;s:3:"sku";s:6:"SKU-44";s:12:"weight_grams";i:1260;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:172;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:5;a:50:{s:2:"id";i:24;s:11:"producer_id";i:1;s:4:"name";s:33:"Σπανάκι Βιολογικό";s:4:"slug";s:18:"spanaki-biologhiko";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:3.8;s:14:"discount_price";N;s:5:"stock";i:72;s:3:"sku";s:6:"SKU-24";s:12:"weight_grams";i:1474;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:72;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:6;a:50:{s:2:"id";i:15;s:11:"producer_id";i:1;s:4:"name";s:35:"Καρπούζια Τυρνάβου";s:4:"slug";s:18:"karpouzia-tirnavoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:1.2;s:14:"discount_price";N;s:5:"stock";i:62;s:3:"sku";s:6:"SKU-15";s:12:"weight_grams";i:1181;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:62;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:7;a:50:{s:2:"id";i:64;s:11:"producer_id";i:1;s:4:"name";s:37:"Ντομάτες Σαντορίνης";s:4:"slug";s:19:"ntomates-santorinis";s:11:"description";s:169:"Μικρές γλυκές ντομάτες από τη Σαντορίνη. Εξαιρετική γεύση λόγω του ηφαιστειογενούς εδάφους.";s:17:"short_description";s:73:"Μικρές γλυκές ντομάτες από τη Σαντορίνη";s:5:"price";d:7.5;s:14:"discount_price";N;s:5:"stock";i:80;s:3:"sku";s:6:"SKU-64";s:12:"weight_grams";i:500;s:10:"dimensions";N;s:10:"main_image";s:78:"https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:14;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:80;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:14;s:4:"name";s:31:"Φρούτα & Λαχανικά";s:4:"slug";s:15:"frouta-laxanika";s:11:"description";s:49:"Φρέσκα φρούτα και λαχανικά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:8;a:50:{s:2:"id";i:63;s:11:"producer_id";i:1;s:4:"name";s:36:"Κασέρι Μετσόβου ΠΟΠ";s:4:"slug";s:19:"kaseri-metsovoy-pop";s:11:"description";s:165:"Αυθεντικό κασέρι Μετσόβου ΠΟΠ από αιγοπρόβειο γάλα. Σκληρό τυρί με έντονη γεύση και άρωμα.";s:17:"short_description";s:55:"Αυθεντικό κασέρι Μετσόβου ΠΟΠ";s:5:"price";d:19.8;s:14:"discount_price";N;s:5:"stock";i:50;s:3:"sku";s:6:"SKU-63";s:12:"weight_grams";i:300;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1452195100486-9cc805987862?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:12;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:50;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:12;s:4:"name";s:39:"Τυριά & Γαλακτοκομικά";s:4:"slug";s:19:"tyria-galaktokomika";s:11:"description";s:61:"Τυριά και γαλακτοκομικά προϊόντα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:9;a:50:{s:2:"id";i:46;s:11:"producer_id";i:8;s:4:"name";s:38:"Μέλι Ελάτης Αρκαδίας";s:4:"slug";s:20:"meli-elatis-arkadias";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:15;s:14:"discount_price";N;s:5:"stock";i:82;s:3:"sku";s:6:"SKU-46";s:12:"weight_grams";i:643;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:82;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:10;a:50:{s:2:"id";i:61;s:11:"producer_id";i:8;s:4:"name";s:36:"Μέλι Πεύκου Εύβοιας";s:4:"slug";s:19:"meli-peukoy-evvoias";s:11:"description";s:172:"Σπάνιο μέλι πεύκου από τα δάση της Εύβοιας. Σκούρο χρώμα, έντονη γεύση και υψηλή θρεπτική αξία.";s:17:"short_description";s:77:"Σπάνιο μέλι πεύκου από τα δάση της Εύβοιας";s:5:"price";d:22.5;s:14:"discount_price";N;s:5:"stock";i:40;s:3:"sku";s:6:"SKU-61";s:12:"weight_grams";i:450;s:10:"dimensions";N;s:10:"main_image";s:78:"https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:11;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:40;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:11;s:4:"name";s:21:"Μέλι & Γλυκά";s:4:"slug";s:10:"meli-glyka";s:11:"description";s:49:"Μέλι και παραδοσιακά γλυκά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:11;a:50:{s:2:"id";i:60;s:11:"producer_id";i:8;s:4:"name";s:40:"Μέλι Θυμαρίσιο Κρήτης";s:4:"slug";s:22:"meli-thymarisio-kritis";s:11:"description";s:173:"Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης. Πλούσιο σε αντιοξειδωτικά και θρεπτικά συστατικά.";s:17:"short_description";s:79:"Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης";s:5:"price";d:18;s:14:"discount_price";N;s:5:"stock";i:60;s:3:"sku";s:6:"SKU-60";s:12:"weight_grams";i:450;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:11;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:60;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:11;s:4:"name";s:21:"Μέλι & Γλυκά";s:4:"slug";s:10:"meli-glyka";s:11:"description";s:49:"Μέλι και παραδοσιακά γλυκά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:12;a:50:{s:2:"id";i:55;s:11:"producer_id";i:8;s:4:"name";s:36:"Μέλι Βουνού Ολύμπου";s:4:"slug";s:19:"meli-boynou-olympoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:20.8;s:14:"discount_price";N;s:5:"stock";i:122;s:3:"sku";s:6:"SKU-55";s:12:"weight_grams";i:1597;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:122;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:13;a:50:{s:2:"id";i:54;s:11:"producer_id";i:8;s:4:"name";s:36:"Μέλι Δάσους Ροδόπης";s:4:"slug";s:19:"meli-dasoys-rodopis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:17.2;s:14:"discount_price";N;s:5:"stock";i:54;s:3:"sku";s:6:"SKU-54";s:12:"weight_grams";i:1369;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:54;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:14;a:50:{s:2:"id";i:53;s:11:"producer_id";i:8;s:4:"name";s:34:"Μέλι Λεβάντας Χίου";s:4:"slug";s:18:"meli-levantas-xioy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:22.5;s:14:"discount_price";N;s:5:"stock";i:180;s:3:"sku";s:6:"SKU-53";s:12:"weight_grams";i:1541;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:180;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:15;a:50:{s:2:"id";i:52;s:11:"producer_id";i:8;s:4:"name";s:50:"Μέλι Πορτοκαλιάς Αργολίδας";s:4:"slug";s:27:"meli-portokalias-argholidas";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:13.9;s:14:"discount_price";N;s:5:"stock";i:150;s:3:"sku";s:6:"SKU-52";s:12:"weight_grams";i:370;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:150;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:16;a:50:{s:2:"id";i:51;s:11:"producer_id";i:8;s:4:"name";s:36:"Μέλι Ερείκης Κρήτης";s:4:"slug";s:18:"meli-erikis-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:19.8;s:14:"discount_price";N;s:5:"stock";i:66;s:3:"sku";s:6:"SKU-51";s:12:"weight_grams";i:910;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:66;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:17;a:50:{s:2:"id";i:50;s:11:"producer_id";i:8;s:4:"name";s:38:"Μέλι Κάστανου Πηλίου";s:4:"slug";s:20:"meli-kastanoy-pilioy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:14.5;s:14:"discount_price";N;s:5:"stock";i:165;s:3:"sku";s:6:"SKU-50";s:12:"weight_grams";i:1526;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:165;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:18;a:50:{s:2:"id";i:49;s:11:"producer_id";i:8;s:4:"name";s:32:"Μέλι Ανθέων Νάξου";s:4:"slug";s:19:"meli-antheon-naksoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:12.2;s:14:"discount_price";N;s:5:"stock";i:54;s:3:"sku";s:6:"SKU-49";s:12:"weight_grams";i:1138;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:54;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:19;a:50:{s:2:"id";i:48;s:11:"producer_id";i:8;s:4:"name";s:36:"Μέλι Πεύκου Εύβοιας";s:4:"slug";s:19:"meli-peukoy-euvoias";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:16.8;s:14:"discount_price";N;s:5:"stock";i:147;s:3:"sku";s:6:"SKU-48";s:12:"weight_grams";i:1993;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:147;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}}s:14:"first_page_url";s:44:"http://localhost:8000/api/v1/products?page=1";s:4:"from";i:1;s:9:"last_page";i:4;s:13:"last_page_url";s:44:"http://localhost:8000/api/v1/products?page=4";s:5:"links";a:6:{i:0;a:3:{s:3:"url";N;s:5:"label";s:16:"&laquo; Previous";s:6:"active";b:0;}i:1;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=1";s:5:"label";s:1:"1";s:6:"active";b:1;}i:2;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=2";s:5:"label";s:1:"2";s:6:"active";b:0;}i:3;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=3";s:5:"label";s:1:"3";s:6:"active";b:0;}i:4;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=4";s:5:"label";s:1:"4";s:6:"active";b:0;}i:5;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=2";s:5:"label";s:12:"Next &raquo;";s:6:"active";b:0;}}s:13:"next_page_url";s:44:"http://localhost:8000/api/v1/products?page=2";s:4:"path";s:37:"http://localhost:8000/api/v1/products";s:8:"per_page";i:20;s:13:"prev_page_url";N;s:2:"to";i:20;s:5:"total";i:65;}	1753389470
dixis_marketplace_cache_dixis_marketplace_cache_:products:856ed1ca1450afb9ade57566a589d2de	a:13:{s:12:"current_page";i:1;s:4:"data";a:65:{i:0;a:50:{s:2:"id";i:8;s:11:"producer_id";i:5;s:4:"name";s:23:"Μήλα Ζαγοράς";s:4:"slug";s:13:"mila-zaghoras";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:4.5;s:14:"discount_price";N;s:5:"stock";i:191;s:3:"sku";s:5:"SKU-8";s:12:"weight_grams";i:1773;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:191;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:1;a:50:{s:2:"id";i:9;s:11:"producer_id";i:5;s:4:"name";s:35:"Κεράσια Ροδοχωρίου";s:4:"slug";s:19:"kerasia-rodokhorioy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:12;s:14:"discount_price";N;s:5:"stock";i:93;s:3:"sku";s:5:"SKU-9";s:12:"weight_grams";i:1999;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:93;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:2;a:50:{s:2:"id";i:10;s:11:"producer_id";i:5;s:4:"name";s:33:"Ακτινίδια Πιερίας";s:4:"slug";s:17:"aktinidia-pierias";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:5.8;s:14:"discount_price";N;s:5:"stock";i:115;s:3:"sku";s:6:"SKU-10";s:12:"weight_grams";i:246;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:115;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:3;a:50:{s:2:"id";i:11;s:11:"producer_id";i:5;s:4:"name";s:31:"Ροδάκινα Νάουσας";s:4:"slug";s:16:"rodakina-naoysas";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:3.9;s:14:"discount_price";N;s:5:"stock";i:92;s:3:"sku";s:6:"SKU-11";s:12:"weight_grams";i:1607;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:92;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:4;a:50:{s:2:"id";i:3;s:11:"producer_id";i:8;s:4:"name";s:27:"Μέλι Θυμαρίσιο";s:4:"slug";s:15:"meli-thymarisio";s:11:"description";s:52:"Θυμαρίσιο μέλι από την Κρήτη";s:17:"short_description";s:0:"";s:5:"price";d:7.99;s:14:"discount_price";N;s:5:"stock";i:30;s:3:"sku";s:5:"SKU-3";s:12:"weight_grams";i:500;s:10:"dimensions";N;s:10:"main_image";N;s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T20:42:15.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:11;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:30;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:11;s:4:"name";s:21:"Μέλι & Γλυκά";s:4:"slug";s:10:"meli-glyka";s:11:"description";s:49:"Μέλι και παραδοσιακά γλυκά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:5;a:50:{s:2:"id";i:12;s:11:"producer_id";i:1;s:4:"name";s:35:"Βερίκοκα Αργολίδας";s:4:"slug";s:19:"berikoka-argholidas";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:4.2;s:14:"discount_price";N;s:5:"stock";i:164;s:3:"sku";s:6:"SKU-12";s:12:"weight_grams";i:1620;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:164;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:6;a:50:{s:2:"id";i:14;s:11:"producer_id";i:1;s:4:"name";s:33:"Αχλάδια Τριπόλεως";s:4:"slug";s:18:"akhladia-tripoleos";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:3.8;s:14:"discount_price";N;s:5:"stock";i:81;s:3:"sku";s:6:"SKU-14";s:12:"weight_grams";i:1198;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:81;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:7;a:50:{s:2:"id";i:16;s:11:"producer_id";i:1;s:4:"name";s:56:"Βιολογικές Ντομάτες Καλαμάτας";s:4:"slug";s:30:"biologhikes-ntomates-kalamatas";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:3.5;s:14:"discount_price";N;s:5:"stock";i:122;s:3:"sku";s:6:"SKU-16";s:12:"weight_grams";i:1068;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:122;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:8;a:50:{s:2:"id";i:17;s:11:"producer_id";i:1;s:4:"name";s:35:"Κολοκυθάκια Κρήτης";s:4:"slug";s:19:"kolokithakia-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:2.8;s:14:"discount_price";N;s:5:"stock";i:100;s:3:"sku";s:6:"SKU-17";s:12:"weight_grams";i:1229;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:100;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:9;a:50:{s:2:"id";i:18;s:11:"producer_id";i:1;s:4:"name";s:35:"Αγγούρια Θεσσαλίας";s:4:"slug";s:21:"aghghouria-thessalias";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:2.2;s:14:"discount_price";N;s:5:"stock";i:57;s:3:"sku";s:6:"SKU-18";s:12:"weight_grams";i:778;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:57;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:10;a:50:{s:2:"id";i:19;s:11:"producer_id";i:1;s:4:"name";s:33:"Πιπεριές Φλωρίνης";s:4:"slug";s:17:"piperies-florinis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:4.5;s:14:"discount_price";N;s:5:"stock";i:174;s:3:"sku";s:6:"SKU-19";s:12:"weight_grams";i:398;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:174;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:11;a:50:{s:2:"id";i:20;s:11:"producer_id";i:1;s:4:"name";s:41:"Μελιτζάνες Τσακώνικες";s:4:"slug";s:21:"melitzanes-tsakwnikes";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:3.2;s:14:"discount_price";N;s:5:"stock";i:142;s:3:"sku";s:6:"SKU-20";s:12:"weight_grams";i:1553;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:142;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:12;a:50:{s:2:"id";i:21;s:11:"producer_id";i:1;s:4:"name";s:35:"Κρεμμύδια Σκοπέλου";s:4:"slug";s:18:"kremmydia-skopeloy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:1.8;s:14:"discount_price";N;s:5:"stock";i:97;s:3:"sku";s:6:"SKU-21";s:12:"weight_grams";i:614;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:97;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:13;a:50:{s:2:"id";i:22;s:11:"producer_id";i:1;s:4:"name";s:25:"Πατάτες Νάξου";s:4:"slug";s:14:"patates-naksoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:2.5;s:14:"discount_price";N;s:5:"stock";i:95;s:3:"sku";s:6:"SKU-22";s:12:"weight_grams";i:1994;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:95;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:14;a:50:{s:2:"id";i:23;s:11:"producer_id";i:1;s:4:"name";s:25:"Καρότα Κρήτης";s:4:"slug";s:13:"karota-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:2.1;s:14:"discount_price";N;s:5:"stock";i:194;s:3:"sku";s:6:"SKU-23";s:12:"weight_grams";i:385;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:194;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:15;a:50:{s:2:"id";i:13;s:11:"producer_id";i:7;s:4:"name";s:35:"Σταφύλια Κορινθίας";s:4:"slug";s:19:"stafylia-korinthias";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:6.5;s:14:"discount_price";N;s:5:"stock";i:156;s:3:"sku";s:6:"SKU-13";s:12:"weight_grams";i:372;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:156;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:7;s:7:"user_id";i:19;s:13:"business_name";s:31:"Αμπελώνες Νεμέας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:104:"Παραγωγή εκλεκτών κρασιών από τους αμπελώνες της Νεμέας.";s:7:"address";N;s:4:"city";s:10:"Νεμέα";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:16;a:50:{s:2:"id";i:7;s:11:"producer_id";i:5;s:4:"name";s:33:"Λεμόνια Αργολίδας";s:4:"slug";s:18:"lemonia-argholidas";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:3.2;s:14:"discount_price";N;s:5:"stock";i:193;s:3:"sku";s:5:"SKU-7";s:12:"weight_grams";i:1062;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:193;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:17;a:50:{s:2:"id";i:1;s:11:"producer_id";i:6;s:4:"name";s:25:"Ελιές Καλαμών";s:4:"slug";s:13:"elies-kalamwn";s:11:"description";s:56:"Ελιές Καλαμών από την Μεσσηνία";s:17:"short_description";s:0:"";s:5:"price";d:5.99;s:14:"discount_price";N;s:5:"stock";i:98;s:3:"sku";s:5:"SKU-1";s:12:"weight_grams";i:500;s:10:"dimensions";N;s:10:"main_image";N;s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T20:42:15.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:10;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:98;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:6;s:7:"user_id";i:18;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιόλαδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";N;s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:52.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:52.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:10;s:4:"name";s:27:"Ελιές & Τουρσιά";s:4:"slug";s:13:"elies-toursia";s:11:"description";s:57:"Παραδοσιακές ελιές και τουρσιά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:18;a:50:{s:2:"id";i:2;s:11:"producer_id";i:6;s:4:"name";s:54:"Ελαιόλαδο Εξαιρετικό Παρθένο";s:4:"slug";s:29:"elaiolado-exairetiko-partheno";s:11:"description";s:85:"Εξαιρετικό παρθένο ελαιόλαδο από την Μεσσηνία";s:17:"short_description";s:0:"";s:5:"price";d:9.99;s:14:"discount_price";N;s:5:"stock";i:50;s:3:"sku";s:5:"SKU-2";s:12:"weight_grams";i:500;s:10:"dimensions";N;s:10:"main_image";N;s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T20:42:15.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:9;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:50;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:6;s:7:"user_id";i:18;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιόλαδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";N;s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:52.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:52.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:9;s:4:"name";s:31:"Ελαιόλαδο & Λάδια";s:4:"slug";s:15:"elaiolado-ladia";s:11:"description";s:72:"Ποικιλία ελαιολάδων και φυτικών ελαίων";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:19;a:50:{s:2:"id";i:4;s:11:"producer_id";i:4;s:4:"name";s:15:"Φέτα ΠΟΠ";s:4:"slug";s:8:"feta-pop";s:11:"description";s:54:"Φέτα ΠΟΠ από αιγοπρόβειο γάλα";s:17:"short_description";s:0:"";s:5:"price";d:8.99;s:14:"discount_price";N;s:5:"stock";i:40;s:3:"sku";s:5:"SKU-4";s:12:"weight_grams";i:500;s:10:"dimensions";N;s:10:"main_image";N;s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T20:42:15.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:12;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:40;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:4;s:7:"user_id";i:4;s:13:"business_name";s:33:"Τυροκομείο Κρήτης";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:108:"Παραδοσιακά κρητικά τυριά από κατσικίσιο και πρόβειο γάλα.";s:7:"address";s:22:"Χανιά, Κρήτη";s:4:"city";s:10:"Χανιά";s:11:"postal_code";N;s:6:"region";s:10:"Κρήτη";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:125:"Τυροκομείο που διατηρεί τις παραδοσιακές συνταγές της κρητικής γης.";s:8:"verified";b:1;s:6:"rating";s:4:"4.70";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:12;s:4:"name";s:39:"Τυριά & Γαλακτοκομικά";s:4:"slug";s:19:"tyria-galaktokomika";s:11:"description";s:61:"Τυριά και γαλακτοκομικά προϊόντα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:20;a:50:{s:2:"id";i:5;s:11:"producer_id";i:7;s:4:"name";s:33:"Κρασί Αγιωργίτικο";s:4:"slug";s:17:"krasi-agiorgitiko";s:11:"description";s:58:"Αγιωργίτικο κρασί από την Νεμέα";s:17:"short_description";s:0:"";s:5:"price";d:12.99;s:14:"discount_price";N;s:5:"stock";i:20;s:3:"sku";s:5:"SKU-5";s:12:"weight_grams";i:500;s:10:"dimensions";N;s:10:"main_image";N;s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T20:50:16.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:14;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:20;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:7;s:7:"user_id";i:19;s:13:"business_name";s:31:"Αμπελώνες Νεμέας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:104:"Παραγωγή εκλεκτών κρασιών από τους αμπελώνες της Νεμέας.";s:7:"address";N;s:4:"city";s:10:"Νεμέα";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:14;s:4:"name";s:31:"Φρούτα & Λαχανικά";s:4:"slug";s:15:"frouta-laxanika";s:11:"description";s:49:"Φρέσκα φρούτα και λαχανικά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:21;a:50:{s:2:"id";i:25;s:11:"producer_id";i:1;s:4:"name";s:33:"Μαρούλι Παγόβουνο";s:4:"slug";s:18:"marouli-paghovoyno";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:1.5;s:14:"discount_price";N;s:5:"stock";i:75;s:3:"sku";s:6:"SKU-25";s:12:"weight_grams";i:1714;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:75;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:22;a:50:{s:2:"id";i:26;s:11:"producer_id";i:1;s:4:"name";s:56:"Βιολογικό Ελαιόλαδο Καλαμάτας";s:4:"slug";s:30:"biologhiko-elaiolado-kalamatas";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:12.5;s:14:"discount_price";N;s:5:"stock";i:56;s:3:"sku";s:6:"SKU-26";s:12:"weight_grams";i:1718;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:3;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:56;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:3;s:4:"name";s:18:"Ελαιόλαδο";s:4:"slug";s:9:"elaiolado";s:11:"description";s:54:"Εξαιρετικό παρθένο ελαιόλαδο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:23;a:50:{s:2:"id";i:27;s:11:"producer_id";i:1;s:4:"name";s:48:"Εξαιρετικό Παρθένο Κρήτης";s:4:"slug";s:27:"eksairetiko-partheno-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:15.8;s:14:"discount_price";N;s:5:"stock";i:186;s:3:"sku";s:6:"SKU-27";s:12:"weight_grams";i:845;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:3;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:186;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:3;s:4:"name";s:18:"Ελαιόλαδο";s:4:"slug";s:9:"elaiolado";s:11:"description";s:54:"Εξαιρετικό παρθένο ελαιόλαδο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:24;a:50:{s:2:"id";i:28;s:11:"producer_id";i:1;s:4:"name";s:37:"Ελαιόλαδο Κορωνείας";s:4:"slug";s:18:"elaiolado-koronias";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:11.2;s:14:"discount_price";N;s:5:"stock";i:82;s:3:"sku";s:6:"SKU-28";s:12:"weight_grams";i:362;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:3;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:82;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:3;s:4:"name";s:18:"Ελαιόλαδο";s:4:"slug";s:9:"elaiolado";s:11:"description";s:54:"Εξαιρετικό παρθένο ελαιόλαδο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:25;a:50:{s:2:"id";i:29;s:11:"producer_id";i:1;s:4:"name";s:40:"Βιολογικό Λάδι Λέσβου";s:4:"slug";s:22:"biologhiko-ladi-lesvoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:14.5;s:14:"discount_price";N;s:5:"stock";i:109;s:3:"sku";s:6:"SKU-29";s:12:"weight_grams";i:1650;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:3;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:109;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:3;s:4:"name";s:18:"Ελαιόλαδο";s:4:"slug";s:9:"elaiolado";s:11:"description";s:54:"Εξαιρετικό παρθένο ελαιόλαδο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:26;a:50:{s:2:"id";i:30;s:11:"producer_id";i:1;s:4:"name";s:42:"Παρθένο Ελαιόλαδο Χίου";s:4:"slug";s:23:"partheno-elaiolado-xioy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:13.9;s:14:"discount_price";N;s:5:"stock";i:75;s:3:"sku";s:6:"SKU-30";s:12:"weight_grams";i:1730;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:3;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:75;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:3;s:4:"name";s:18:"Ελαιόλαδο";s:4:"slug";s:9:"elaiolado";s:11:"description";s:54:"Εξαιρετικό παρθένο ελαιόλαδο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:27;a:50:{s:2:"id";i:31;s:11:"producer_id";i:1;s:4:"name";s:29:"Ελαιόλαδο Μάνης";s:4:"slug";s:15:"elaiolado-manis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:16.2;s:14:"discount_price";N;s:5:"stock";i:118;s:3:"sku";s:6:"SKU-31";s:12:"weight_grams";i:1417;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:3;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:118;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:3;s:4:"name";s:18:"Ελαιόλαδο";s:4:"slug";s:9:"elaiolado";s:11:"description";s:54:"Εξαιρετικό παρθένο ελαιόλαδο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:28;a:50:{s:2:"id";i:32;s:11:"producer_id";i:1;s:4:"name";s:44:"Βιολογικό Λάδι Ζακύνθου";s:4:"slug";s:25:"biologhiko-ladi-zakynthoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:12.8;s:14:"discount_price";N;s:5:"stock";i:162;s:3:"sku";s:6:"SKU-32";s:12:"weight_grams";i:409;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:3;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:162;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:3;s:4:"name";s:18:"Ελαιόλαδο";s:4:"slug";s:9:"elaiolado";s:11:"description";s:54:"Εξαιρετικό παρθένο ελαιόλαδο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:29;a:50:{s:2:"id";i:33;s:11:"producer_id";i:1;s:4:"name";s:46:"Εξαιρετικό Λάδι Αμφίσσης";s:4:"slug";s:25:"eksairetiko-ladi-amfissis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:14.2;s:14:"discount_price";N;s:5:"stock";i:83;s:3:"sku";s:6:"SKU-33";s:12:"weight_grams";i:324;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:3;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:83;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:3;s:4:"name";s:18:"Ελαιόλαδο";s:4:"slug";s:9:"elaiolado";s:11:"description";s:54:"Εξαιρετικό παρθένο ελαιόλαδο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:30;a:50:{s:2:"id";i:34;s:11:"producer_id";i:1;s:4:"name";s:38:"Παρθένο Λάδι Αίγινας";s:4:"slug";s:22:"partheno-ladi-aighinas";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:15.5;s:14:"discount_price";N;s:5:"stock";i:163;s:3:"sku";s:6:"SKU-34";s:12:"weight_grams";i:360;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:3;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:163;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:3;s:4:"name";s:18:"Ελαιόλαδο";s:4:"slug";s:9:"elaiolado";s:11:"description";s:54:"Εξαιρετικό παρθένο ελαιόλαδο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:31;a:50:{s:2:"id";i:35;s:11:"producer_id";i:1;s:4:"name";s:37:"Ελαιόλαδο Μυτιλήνης";s:4:"slug";s:19:"elaiolado-mitilinis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:13.2;s:14:"discount_price";N;s:5:"stock";i:179;s:3:"sku";s:6:"SKU-35";s:12:"weight_grams";i:254;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:3;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:179;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:3;s:4:"name";s:18:"Ελαιόλαδο";s:4:"slug";s:9:"elaiolado";s:11:"description";s:54:"Εξαιρετικό παρθένο ελαιόλαδο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:32;a:50:{s:2:"id";i:43;s:11:"producer_id";i:4;s:4:"name";s:40:"Κατσικίσιο Τυρί Μήλου";s:4:"slug";s:21:"katsikisio-tiri-miloy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:11.5;s:14:"discount_price";N;s:5:"stock";i:113;s:3:"sku";s:6:"SKU-43";s:12:"weight_grams";i:1872;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:113;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:4;s:7:"user_id";i:4;s:13:"business_name";s:33:"Τυροκομείο Κρήτης";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:108:"Παραδοσιακά κρητικά τυριά από κατσικίσιο και πρόβειο γάλα.";s:7:"address";s:22:"Χανιά, Κρήτη";s:4:"city";s:10:"Χανιά";s:11:"postal_code";N;s:6:"region";s:10:"Κρήτη";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:125:"Τυροκομείο που διατηρεί τις παραδοσιακές συνταγές της κρητικής γης.";s:8:"verified";b:1;s:6:"rating";s:4:"4.70";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:33;a:50:{s:2:"id";i:37;s:11:"producer_id";i:1;s:4:"name";s:25:"Κασέρι Κρήτης";s:4:"slug";s:13:"kaseri-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:12.5;s:14:"discount_price";N;s:5:"stock";i:72;s:3:"sku";s:6:"SKU-37";s:12:"weight_grams";i:1153;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:72;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:34;a:50:{s:2:"id";i:38;s:11:"producer_id";i:1;s:4:"name";s:27:"Γραβιέρα Νάξου";s:4:"slug";s:15:"graviera-naksoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:15.8;s:14:"discount_price";N;s:5:"stock";i:148;s:3:"sku";s:6:"SKU-38";s:12:"weight_grams";i:293;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:148;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:35;a:50:{s:2:"id";i:39;s:11:"producer_id";i:1;s:4:"name";s:33:"Κεφαλοτύρι Κρήτης";s:4:"slug";s:17:"kefalotyri-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:14.2;s:14:"discount_price";N;s:5:"stock";i:91;s:3:"sku";s:6:"SKU-39";s:12:"weight_grams";i:365;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:91;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:36;a:50:{s:2:"id";i:40;s:11:"producer_id";i:1;s:4:"name";s:27:"Μυζήθρα Κρήτης";s:4:"slug";s:15:"mizithra-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:6.5;s:14:"discount_price";N;s:5:"stock";i:180;s:3:"sku";s:6:"SKU-40";s:12:"weight_grams";i:1487;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:180;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:37;a:50:{s:2:"id";i:41;s:11:"producer_id";i:1;s:4:"name";s:29:"Ανθότυρο Κρήτης";s:4:"slug";s:16:"anthotiro-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:7.8;s:14:"discount_price";N;s:5:"stock";i:151;s:3:"sku";s:6:"SKU-41";s:12:"weight_grams";i:1880;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:151;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:38;a:50:{s:2:"id";i:42;s:11:"producer_id";i:1;s:4:"name";s:27:"Μανούρι Κρήτης";s:4:"slug";s:14:"manouri-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:9.2;s:14:"discount_price";N;s:5:"stock";i:138;s:3:"sku";s:6:"SKU-42";s:12:"weight_grams";i:1983;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:138;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:39;a:50:{s:2:"id";i:36;s:11:"producer_id";i:4;s:4:"name";s:32:"Φέτα ΠΟΠ Μετσόβου";s:4:"slug";s:17:"feta-pop-metsovoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:8.9;s:14:"discount_price";N;s:5:"stock";i:133;s:3:"sku";s:6:"SKU-36";s:12:"weight_grams";i:989;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:133;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:4;s:7:"user_id";i:4;s:13:"business_name";s:33:"Τυροκομείο Κρήτης";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:108:"Παραδοσιακά κρητικά τυριά από κατσικίσιο και πρόβειο γάλα.";s:7:"address";s:22:"Χανιά, Κρήτη";s:4:"city";s:10:"Χανιά";s:11:"postal_code";N;s:6:"region";s:10:"Κρήτη";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:125:"Τυροκομείο που διατηρεί τις παραδοσιακές συνταγές της κρητικής γης.";s:8:"verified";b:1;s:6:"rating";s:4:"4.70";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:40;a:50:{s:2:"id";i:45;s:11:"producer_id";i:1;s:4:"name";s:35:"Λαδοτύρι Μυτιλήνης";s:4:"slug";s:18:"ladotyri-mitilinis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:16.2;s:14:"discount_price";N;s:5:"stock";i:70;s:3:"sku";s:6:"SKU-45";s:12:"weight_grams";i:263;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:70;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:41;a:50:{s:2:"id";i:47;s:11:"producer_id";i:8;s:4:"name";s:40:"Μέλι Θυμαρίσιο Κρήτης";s:4:"slug";s:22:"meli-thimarisio-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:18.5;s:14:"discount_price";N;s:5:"stock";i:127;s:3:"sku";s:6:"SKU-47";s:12:"weight_grams";i:901;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:127;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:42;a:50:{s:2:"id";i:48;s:11:"producer_id";i:8;s:4:"name";s:36:"Μέλι Πεύκου Εύβοιας";s:4:"slug";s:19:"meli-peukoy-euvoias";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:16.8;s:14:"discount_price";N;s:5:"stock";i:147;s:3:"sku";s:6:"SKU-48";s:12:"weight_grams";i:1993;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:147;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:43;a:50:{s:2:"id";i:49;s:11:"producer_id";i:8;s:4:"name";s:32:"Μέλι Ανθέων Νάξου";s:4:"slug";s:19:"meli-antheon-naksoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:12.2;s:14:"discount_price";N;s:5:"stock";i:54;s:3:"sku";s:6:"SKU-49";s:12:"weight_grams";i:1138;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:54;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:44;a:50:{s:2:"id";i:50;s:11:"producer_id";i:8;s:4:"name";s:38:"Μέλι Κάστανου Πηλίου";s:4:"slug";s:20:"meli-kastanoy-pilioy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:14.5;s:14:"discount_price";N;s:5:"stock";i:165;s:3:"sku";s:6:"SKU-50";s:12:"weight_grams";i:1526;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:165;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:45;a:50:{s:2:"id";i:51;s:11:"producer_id";i:8;s:4:"name";s:36:"Μέλι Ερείκης Κρήτης";s:4:"slug";s:18:"meli-erikis-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:19.8;s:14:"discount_price";N;s:5:"stock";i:66;s:3:"sku";s:6:"SKU-51";s:12:"weight_grams";i:910;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:66;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:46;a:50:{s:2:"id";i:52;s:11:"producer_id";i:8;s:4:"name";s:50:"Μέλι Πορτοκαλιάς Αργολίδας";s:4:"slug";s:27:"meli-portokalias-argholidas";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:13.9;s:14:"discount_price";N;s:5:"stock";i:150;s:3:"sku";s:6:"SKU-52";s:12:"weight_grams";i:370;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:150;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:47;a:50:{s:2:"id";i:53;s:11:"producer_id";i:8;s:4:"name";s:34:"Μέλι Λεβάντας Χίου";s:4:"slug";s:18:"meli-levantas-xioy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:22.5;s:14:"discount_price";N;s:5:"stock";i:180;s:3:"sku";s:6:"SKU-53";s:12:"weight_grams";i:1541;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:180;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:48;a:50:{s:2:"id";i:54;s:11:"producer_id";i:8;s:4:"name";s:36:"Μέλι Δάσους Ροδόπης";s:4:"slug";s:19:"meli-dasoys-rodopis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:17.2;s:14:"discount_price";N;s:5:"stock";i:54;s:3:"sku";s:6:"SKU-54";s:12:"weight_grams";i:1369;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:54;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:49;a:50:{s:2:"id";i:55;s:11:"producer_id";i:8;s:4:"name";s:36:"Μέλι Βουνού Ολύμπου";s:4:"slug";s:19:"meli-boynou-olympoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:20.8;s:14:"discount_price";N;s:5:"stock";i:122;s:3:"sku";s:6:"SKU-55";s:12:"weight_grams";i:1597;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:122;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:50;a:50:{s:2:"id";i:60;s:11:"producer_id";i:8;s:4:"name";s:40:"Μέλι Θυμαρίσιο Κρήτης";s:4:"slug";s:22:"meli-thymarisio-kritis";s:11:"description";s:173:"Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης. Πλούσιο σε αντιοξειδωτικά και θρεπτικά συστατικά.";s:17:"short_description";s:79:"Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης";s:5:"price";d:18;s:14:"discount_price";N;s:5:"stock";i:60;s:3:"sku";s:6:"SKU-60";s:12:"weight_grams";i:450;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:11;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:60;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:11;s:4:"name";s:21:"Μέλι & Γλυκά";s:4:"slug";s:10:"meli-glyka";s:11:"description";s:49:"Μέλι και παραδοσιακά γλυκά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:51;a:50:{s:2:"id";i:57;s:11:"producer_id";i:1;s:4:"name";s:52:"Βιολογικό Ελαιόλαδο Καλαμών";s:4:"slug";s:27:"viologiko-elaiolado-kalamon";s:11:"description";s:203:"Βιολογικό εξτραπάρθενο ελαιόλαδο από ελιές Καλαμών. Πιστοποιημένο βιολογικό προϊόν με έντονο άρωμα και γεύση.";s:17:"short_description";s:80:"Βιολογικό ελαιόλαδο Καλαμών, πιστοποιημένο";s:5:"price";d:15.8;s:14:"discount_price";N;s:5:"stock";i:80;s:3:"sku";s:6:"SKU-57";s:12:"weight_grams";i:750;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:9;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:80;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:9;s:4:"name";s:31:"Ελαιόλαδο & Λάδια";s:4:"slug";s:15:"elaiolado-ladia";s:11:"description";s:72:"Ποικιλία ελαιολάδων και φυτικών ελαίων";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:52;a:50:{s:2:"id";i:58;s:11:"producer_id";i:1;s:4:"name";s:48:"Ελιές Καλαμών Εξαιρετικές";s:4:"slug";s:25:"elies-kalamon-exairetikes";s:11:"description";s:189:"Εκλεκτές ελιές Καλαμών, μεγάλου μεγέθους, παραδοσιακής επεξεργασίας. Ιδανικές για μεζέδες και σαλάτες.";s:17:"short_description";s:74:"Εκλεκτές ελιές Καλαμών μεγάλου μεγέθους";s:5:"price";d:8.9;s:14:"discount_price";N;s:5:"stock";i:200;s:3:"sku";s:6:"SKU-58";s:12:"weight_grams";i:400;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1611171711912-e0be6da4e3c4?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:10;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:200;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:10;s:4:"name";s:27:"Ελιές & Τουρσιά";s:4:"slug";s:13:"elies-toursia";s:11:"description";s:57:"Παραδοσιακές ελιές και τουρσιά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:53;a:50:{s:2:"id";i:59;s:11:"producer_id";i:1;s:4:"name";s:48:"Ελιές Χαλκιδικής Γεμιστές";s:4:"slug";s:25:"elies-xalkidikis-gemistes";s:11:"description";s:172:"Πράσινες ελιές Χαλκιδικής γεμιστές με αμύγδαλο. Τραγανές και νόστιμες, ιδανικές για απεριτίφ.";s:17:"short_description";s:87:"Πράσινες ελιές Χαλκιδικής γεμιστές με αμύγδαλο";s:5:"price";d:6.5;s:14:"discount_price";N;s:5:"stock";i:120;s:3:"sku";s:6:"SKU-59";s:12:"weight_grams";i:350;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1605207616227-7c4b6b5b3b8a?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:10;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:120;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:10;s:4:"name";s:27:"Ελιές & Τουρσιά";s:4:"slug";s:13:"elies-toursia";s:11:"description";s:57:"Παραδοσιακές ελιές και τουρσιά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:54;a:50:{s:2:"id";i:61;s:11:"producer_id";i:8;s:4:"name";s:36:"Μέλι Πεύκου Εύβοιας";s:4:"slug";s:19:"meli-peukoy-evvoias";s:11:"description";s:172:"Σπάνιο μέλι πεύκου από τα δάση της Εύβοιας. Σκούρο χρώμα, έντονη γεύση και υψηλή θρεπτική αξία.";s:17:"short_description";s:77:"Σπάνιο μέλι πεύκου από τα δάση της Εύβοιας";s:5:"price";d:22.5;s:14:"discount_price";N;s:5:"stock";i:40;s:3:"sku";s:6:"SKU-61";s:12:"weight_grams";i:450;s:10:"dimensions";N;s:10:"main_image";s:78:"https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:11;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:40;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:11;s:4:"name";s:21:"Μέλι & Γλυκά";s:4:"slug";s:10:"meli-glyka";s:11:"description";s:49:"Μέλι και παραδοσιακά γλυκά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:55;a:50:{s:2:"id";i:46;s:11:"producer_id";i:8;s:4:"name";s:38:"Μέλι Ελάτης Αρκαδίας";s:4:"slug";s:20:"meli-elatis-arkadias";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:15;s:14:"discount_price";N;s:5:"stock";i:82;s:3:"sku";s:6:"SKU-46";s:12:"weight_grams";i:643;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:28.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:5;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:82;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:8;s:7:"user_id";i:20;s:13:"business_name";s:47:"Μελισσοκομείο Χαλκιδικής";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:110:"Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.";s:7:"address";N;s:4:"city";s:18:"Χαλκιδική";s:11:"postal_code";N;s:6:"region";N;s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";N;s:8:"verified";b:0;s:6:"rating";N;s:10:"created_at";s:27:"2025-07-24T06:20:53.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:20:53.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:1;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:5;s:4:"name";s:8:"Μέλι";s:4:"slug";s:4:"meli";s:11:"description";s:56:"Φυσικό μέλι από ελληνικά βουνά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:56;a:50:{s:2:"id";i:15;s:11:"producer_id";i:1;s:4:"name";s:35:"Καρπούζια Τυρνάβου";s:4:"slug";s:18:"karpouzia-tirnavoy";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:1.2;s:14:"discount_price";N;s:5:"stock";i:62;s:3:"sku";s:6:"SKU-15";s:12:"weight_grams";i:1181;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:62;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:57;a:50:{s:2:"id";i:24;s:11:"producer_id";i:1;s:4:"name";s:33:"Σπανάκι Βιολογικό";s:4:"slug";s:18:"spanaki-biologhiko";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:3.8;s:14:"discount_price";N;s:5:"stock";i:72;s:3:"sku";s:6:"SKU-24";s:12:"weight_grams";i:1474;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:2;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:72;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:2;s:4:"name";s:16:"Λαχανικά";s:4:"slug";s:9:"lachanika";s:11:"description";s:52:"Φρέσκα λαχανικά από τον κήπο";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:58;a:50:{s:2:"id";i:44;s:11:"producer_id";i:1;s:4:"name";s:35:"Φορμαέλλα Αράχωβας";s:4:"slug";s:19:"formaella-arakhovas";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:13.8;s:14:"discount_price";N;s:5:"stock";i:172;s:3:"sku";s:6:"SKU-44";s:12:"weight_grams";i:1260;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:4;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:172;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:4;s:4:"name";s:10:"Τυριά";s:4:"slug";s:5:"tyria";s:11:"description";s:50:"Παραδοσιακά ελληνικά τυριά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:59;a:50:{s:2:"id";i:56;s:11:"producer_id";i:1;s:4:"name";s:62:"Εξτραπάρθενο Ελαιόλαδο Κορωνέικη";s:4:"slug";s:32:"extraparteno-elaiolado-koroneiki";s:11:"description";s:250:"Εξαιρετικής ποιότητας εξτραπάρθενο ελαιόλαδο από ελιές Κορωνέικη. Ψυχρή εκχύλιση, χαμηλή οξύτητα 0.2%. Ιδανικό για σαλάτες και μαγείρεμα.";s:17:"short_description";s:91:"Εξτραπάρθενο ελαιόλαδο Κορωνέικη, ψυχρή εκχύλιση";s:5:"price";d:12.5;s:14:"discount_price";N;s:5:"stock";i:150;s:3:"sku";s:6:"SKU-56";s:12:"weight_grams";i:500;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:9;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:150;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:9;s:4:"name";s:31:"Ελαιόλαδο & Λάδια";s:4:"slug";s:15:"elaiolado-ladia";s:11:"description";s:72:"Ποικιλία ελαιολάδων και φυτικών ελαίων";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:60;a:50:{s:2:"id";i:63;s:11:"producer_id";i:1;s:4:"name";s:36:"Κασέρι Μετσόβου ΠΟΠ";s:4:"slug";s:19:"kaseri-metsovoy-pop";s:11:"description";s:165:"Αυθεντικό κασέρι Μετσόβου ΠΟΠ από αιγοπρόβειο γάλα. Σκληρό τυρί με έντονη γεύση και άρωμα.";s:17:"short_description";s:55:"Αυθεντικό κασέρι Μετσόβου ΠΟΠ";s:5:"price";d:19.8;s:14:"discount_price";N;s:5:"stock";i:50;s:3:"sku";s:6:"SKU-63";s:12:"weight_grams";i:300;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1452195100486-9cc805987862?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:12;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:50;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:12;s:4:"name";s:39:"Τυριά & Γαλακτοκομικά";s:4:"slug";s:19:"tyria-galaktokomika";s:11:"description";s:61:"Τυριά και γαλακτοκομικά προϊόντα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:61;a:50:{s:2:"id";i:64;s:11:"producer_id";i:1;s:4:"name";s:37:"Ντομάτες Σαντορίνης";s:4:"slug";s:19:"ntomates-santorinis";s:11:"description";s:169:"Μικρές γλυκές ντομάτες από τη Σαντορίνη. Εξαιρετική γεύση λόγω του ηφαιστειογενούς εδάφους.";s:17:"short_description";s:73:"Μικρές γλυκές ντομάτες από τη Σαντορίνη";s:5:"price";d:7.5;s:14:"discount_price";N;s:5:"stock";i:80;s:3:"sku";s:6:"SKU-64";s:12:"weight_grams";i:500;s:10:"dimensions";N;s:10:"main_image";s:78:"https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:56:41.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:14;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:80;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:1;s:7:"user_id";i:1;s:13:"business_name";s:35:"Ελαιώνες Καλαμάτας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:137:"Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.";s:7:"address";s:34:"Καλαμάτα, Μεσσηνία";s:4:"city";s:16:"Καλαμάτα";s:11:"postal_code";N;s:6:"region";s:24:"Πελοπόννησος";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:138:"Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.";s:8:"verified";b:1;s:6:"rating";s:4:"4.90";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:14;s:4:"name";s:31:"Φρούτα & Λαχανικά";s:4:"slug";s:15:"frouta-laxanika";s:11:"description";s:49:"Φρέσκα φρούτα και λαχανικά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:62;a:50:{s:2:"id";i:62;s:11:"producer_id";i:4;s:4:"name";s:38:"Φέτα ΠΟΠ Δωδεκανήσου";s:4:"slug";s:20:"feta-pop-dodekanisoy";s:11:"description";s:181:"Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα. Κρεμώδης υφή, αλμυρή γεύση, ιδανική για ελληνική σαλάτα.";s:17:"short_description";s:77:"Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα";s:5:"price";d:14.2;s:14:"discount_price";N;s:5:"stock";i:90;s:3:"sku";s:6:"SKU-62";s:12:"weight_grams";i:400;s:10:"dimensions";N;s:10:"main_image";s:81:"https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:12;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:90;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:4;s:7:"user_id";i:4;s:13:"business_name";s:33:"Τυροκομείο Κρήτης";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:108:"Παραδοσιακά κρητικά τυριά από κατσικίσιο και πρόβειο γάλα.";s:7:"address";s:22:"Χανιά, Κρήτη";s:4:"city";s:10:"Χανιά";s:11:"postal_code";N;s:6:"region";s:10:"Κρήτη";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:125:"Τυροκομείο που διατηρεί τις παραδοσιακές συνταγές της κρητικής γης.";s:8:"verified";b:1;s:6:"rating";s:4:"4.70";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:12;s:4:"name";s:39:"Τυριά & Γαλακτοκομικά";s:4:"slug";s:19:"tyria-galaktokomika";s:11:"description";s:61:"Τυριά και γαλακτοκομικά προϊόντα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:63;a:50:{s:2:"id";i:6;s:11:"producer_id";i:5;s:4:"name";s:52:"Πορτοκάλια Βαλέντσια Κρήτης";s:4:"slug";s:27:"portokalia-balentsia-kritis";s:11:"description";s:151:"Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.";s:17:"short_description";s:0:"";s:5:"price";d:2.5;s:14:"discount_price";N;s:5:"stock";i:193;s:3:"sku";s:5:"SKU-6";s:12:"weight_grams";i:1190;s:10:"dimensions";N;s:10:"main_image";s:63:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500";s:9:"is_active";b:1;s:11:"is_featured";b:0;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:1;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:193;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:1;s:4:"name";s:12:"Φρούτα";s:4:"slug";s:6:"frouta";s:11:"description";s:42:"Φρέσκα εποχιακά φρούτα";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}i:64;a:50:{s:2:"id";i:65;s:11:"producer_id";i:5;s:4:"name";s:39:"Πορτοκάλια Αργολίδας";s:4:"slug";s:20:"portokalia-argolidas";s:11:"description";s:163:"Φρέσκα πορτοκάλια από τους κήπους της Αργολίδας. Ζουμερά και γλυκά, πλούσια σε βιταμίνη C.";s:17:"short_description";s:64:"Φρέσκα πορτοκάλια από την Αργολίδα";s:5:"price";d:3.2;s:14:"discount_price";N;s:5:"stock";i:200;s:3:"sku";s:6:"SKU-65";s:12:"weight_grams";i:1000;s:10:"dimensions";N;s:10:"main_image";s:78:"https://images.unsplash.com/photo-1547514701-42782101795e?w=500&h=500&fit=crop";s:9:"is_active";b:1;s:11:"is_featured";b:1;s:11:"is_seasonal";b:0;s:12:"season_start";N;s:10:"season_end";N;s:18:"is_limited_edition";b:0;s:16:"limited_quantity";N;s:28:"allow_wishlist_notifications";b:1;s:10:"attributes";N;s:10:"created_at";s:27:"2025-07-23T12:49:20.000000Z";s:10:"updated_at";s:27:"2025-07-24T06:21:40.000000Z";s:9:"tenant_id";N;s:13:"b2b_available";b:0;s:15:"wholesale_price";N;s:18:"min_order_quantity";i:1;s:18:"max_order_quantity";N;s:23:"bulk_discount_threshold";N;s:24:"bulk_discount_percentage";N;s:15:"b2b_description";N;s:18:"b2b_specifications";N;s:11:"category_id";i:14;s:9:"length_cm";N;s:8:"width_cm";N;s:9:"height_cm";N;s:13:"is_perishable";b:0;s:10:"is_fragile";b:0;s:11:"seasonality";N;s:6:"status";s:7:"pending";s:10:"is_organic";b:0;s:8:"is_vegan";b:0;s:14:"is_gluten_free";b:0;s:6:"weight";N;s:14:"stock_quantity";i:200;s:18:"quickbooks_item_id";N;s:20:"quickbooks_synced_at";N;s:8:"producer";a:24:{s:2:"id";i:5;s:7:"user_id";i:5;s:13:"business_name";s:37:"Αγρόκτημα Θεσσαλίας";s:6:"tax_id";N;s:10:"tax_office";N;s:11:"description";s:101:"Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.";s:7:"address";s:30:"Λάρισα, Θεσσαλία";s:4:"city";s:12:"Λάρισα";s:11:"postal_code";N;s:6:"region";s:16:"Θεσσαλία";s:4:"logo";N;s:11:"cover_image";N;s:7:"website";N;s:12:"social_media";N;s:3:"bio";s:131:"Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.";s:8:"verified";b:1;s:6:"rating";s:4:"4.60";s:10:"created_at";s:27:"2025-07-23T12:45:19.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:45:19.000000Z";s:9:"tenant_id";N;s:26:"uses_custom_shipping_rates";b:0;s:8:"latitude";N;s:9:"longitude";N;s:15:"map_description";N;}s:8:"category";a:7:{s:2:"id";i:14;s:4:"name";s:31:"Φρούτα & Λαχανικά";s:4:"slug";s:15:"frouta-laxanika";s:11:"description";s:49:"Φρέσκα φρούτα και λαχανικά";s:10:"created_at";s:27:"2025-07-23T12:44:07.000000Z";s:10:"updated_at";s:27:"2025-07-23T12:44:07.000000Z";s:9:"tenant_id";N;}}}s:14:"first_page_url";s:44:"http://localhost:8000/api/v1/products?page=1";s:4:"from";i:1;s:9:"last_page";i:1;s:13:"last_page_url";s:44:"http://localhost:8000/api/v1/products?page=1";s:5:"links";a:3:{i:0;a:3:{s:3:"url";N;s:5:"label";s:16:"&laquo; Previous";s:6:"active";b:0;}i:1;a:3:{s:3:"url";s:44:"http://localhost:8000/api/v1/products?page=1";s:5:"label";s:1:"1";s:6:"active";b:1;}i:2;a:3:{s:3:"url";N;s:5:"label";s:12:"Next &raquo;";s:6:"active";b:0;}}s:13:"next_page_url";N;s:4:"path";s:37:"http://localhost:8000/api/v1/products";s:8:"per_page";i:100;s:13:"prev_page_url";N;s:2:"to";i:65;s:5:"total";i:65;}	1753390533
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, product_id, quantity, price, attributes, created_at, updated_at) FROM stdin;
1	1	1	2	5.99	\N	2025-07-23 16:00:15	2025-07-23 16:00:15
2	2	1	5	5.99	\N	2025-07-23 17:15:22	2025-07-23 17:15:27
3	3	1	2	5.99	\N	2025-07-23 22:04:34	2025-07-23 22:04:34
4	5	1	2	5.99	\N	2025-07-24 03:56:47	2025-07-24 03:56:47
5	6	1	2	5.99	\N	2025-07-24 04:01:43	2025-07-24 04:01:43
6	7	65	2	3.20	\N	2025-07-24 17:43:39	2025-07-24 17:43:39
7	8	65	1	3.20	\N	2025-07-24 17:54:31	2025-07-24 17:54:31
8	9	65	2	3.20	\N	2025-07-24 20:08:19	2025-07-24 20:08:19
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, user_id, session_id, expires_at, created_at, updated_at) FROM stdin;
1	\N	v2m9dmvki6Wx4qtZWT13bRxTsOFR5HaetuLHahpA	2025-07-30 16:00:05	2025-07-23 16:00:05	2025-07-23 16:00:05
2	\N	2pT53gf2xleu6dKF05G7efuCnllYYh80i04akrVO	2025-07-30 17:15:16	2025-07-23 17:15:16	2025-07-23 17:15:16
3	\N	epXhl4Xbmtow3KA1IJnPNfmHrqLZ4ZpBvsUMHvsM	2025-07-30 22:04:29	2025-07-23 22:04:29	2025-07-23 22:04:29
4	\N	dxGgPcAD7ZQOhFQ9n9JiaPqYAF76WKUTpIm46esf	2025-07-31 03:19:29	2025-07-24 03:19:29	2025-07-24 03:19:29
5	\N	aBYa7fZtrI1e3gFxzGM2oRvu2xtC6RSq4XkKIeu4	2025-07-31 03:56:42	2025-07-24 03:56:42	2025-07-24 03:56:42
6	\N	Oi6Ah2xIqkd8P9rK8CJZiBeTGUSfihdBZ7eXGn0e	2025-07-31 04:01:33	2025-07-24 04:01:33	2025-07-24 04:01:33
7	\N	wO84cpaDgRmMIJ7p9gpkmNI5evYmOCovOMFpiSwn	2025-07-31 17:43:29	2025-07-24 17:43:29	2025-07-24 17:43:29
8	\N	w5NhvodWCahFP7HSH4c6BRxf9LFtdyD7VOKyeFeQ	2025-07-31 17:54:31	2025-07-24 17:54:31	2025-07-24 17:54:31
9	\N	Lz39k2REBJ7zBa0A1tK7z3P4sATbxYhnaafHPXXF	2025-07-31 20:08:19	2025-07-24 20:08:19	2025-07-24 20:08:19
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, created_at, updated_at, tenant_id) FROM stdin;
1	Φρούτα	frouta	Φρέσκα εποχιακά φρούτα	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
2	Λαχανικά	lachanika	Φρέσκα λαχανικά από τον κήπο	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
3	Ελαιόλαδο	elaiolado	Εξαιρετικό παρθένο ελαιόλαδο	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
4	Τυριά	tyria	Παραδοσιακά ελληνικά τυριά	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
5	Μέλι	meli	Φυσικό μέλι από ελληνικά βουνά	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
6	Κρέας	kreas	Φρέσκο κρέας από ελληνικές φάρμες	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
7	Ψάρια	psaria	Φρέσκα ψάρια από ελληνικές θάλασσες	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
8	Αρτοποιήματα	artopoiimata	Φρέσκο ψωμί και αρτοποιήματα	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
9	Ελαιόλαδο & Λάδια	elaiolado-ladia	Ποικιλία ελαιολάδων και φυτικών ελαίων	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
10	Ελιές & Τουρσιά	elies-toursia	Παραδοσιακές ελιές και τουρσιά	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
11	Μέλι & Γλυκά	meli-glyka	Μέλι και παραδοσιακά γλυκά	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
12	Τυριά & Γαλακτοκομικά	tyria-galaktokomika	Τυριά και γαλακτοκομικά προϊόντα	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
13	Κρέας & Αλλαντικά	kreas-allantika	Κρέας και αλλαντικά προϊόντα	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
14	Φρούτα & Λαχανικά	frouta-laxanika	Φρέσκα φρούτα και λαχανικά	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
15	Αρτοποιία & Ζυμαρικά	artopoiia-zymarika	Ψωμί, ζυμαρικά και αρτοποιήματα	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
16	Κρασιά & Ποτά	krasia-pota	Κρασιά και παραδοσιακά ποτά	2025-07-23 12:44:07	2025-07-23 12:44:07	\N
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_messages (id, name, email, phone, subject, message, accept_terms, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contracts (id, tenant_id, business_user_id, contract_number, title, description, type, status, start_date, end_date, auto_renewal, renewal_period, minimum_order_value, maximum_order_value, discount_percentage, payment_terms, delivery_terms, terms_and_conditions, special_conditions, created_by, approved_by, signed_at, activated_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: delivery_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_methods (id, code, name, description, is_active, max_weight_grams, max_length_cm, max_width_cm, max_height_cm, supports_cod, suitable_for_perishable, suitable_for_fragile) FROM stdin;
\.


--
-- Data for Name: extra_weight_charges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.extra_weight_charges (id, shipping_zone_id, delivery_method_id, price_per_kg) FROM stdin;
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (id, user_id, product_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: integration_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_logs (id, service_name, operation, external_id, model_type, model_id, request_data, response_data, status, error_message, response_time_ms, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: integration_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_settings (id, service, user_id, tokens, realm_id, settings, connected_at, last_sync_at, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (id, tenant_id, invoice_id, product_id, description, quantity, unit_price, discount_amount, tax_rate, tax_amount, total_amount, product_sku, product_name, unit_of_measure, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoice_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_payments (id, tenant_id, invoice_id, payment_method, amount, currency, payment_date, transaction_id, reference_number, notes, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, tenant_id, order_id, user_id, invoice_number, invoice_type, status, issue_date, due_date, paid_date, subtotal, tax_amount, discount_amount, total_amount, currency, payment_terms, notes, pdf_path, pdf_url, email_sent_at, quickbooks_id, xero_id, created_by, approved_by, approved_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
3	2025_03_29_100007_create_categories_table	1
4	2024_03_20_000000_create_products_table	1
16	0001_01_01_000000_create_users_table	2
17	0001_01_01_000001_create_cache_table	2
18	0001_01_01_000002_create_jobs_table	2
19	2025_03_28_213533_create_producers_table	3
20	2025_03_28_213546_create_products_table	4
21	2025_03_28_213622_create_product_categories_table	5
22	2025_03_28_213641_create_addresses_table	6
23	2023_04_15_000001_create_reviews_table	7
24	2023_04_15_000002_create_wishlists_table	7
25	2023_04_15_000003_create_producer_documents_table	7
26	2023_07_15_000000_create_businesses_table	7
27	2023_07_16_000000_update_businesses_table_for_subscriptions	7
28	2024_01_01_000001_create_tenants_table	7
29	2024_01_01_000002_create_tenant_themes_table	7
30	2025_03_28_213657_create_orders_table	8
31	2024_01_01_000003_create_revenue_shares_table	9
32	2024_01_01_000004_add_tenant_id_to_existing_tables	9
33	2024_01_01_000005_create_business_users_table	9
34	2024_01_01_000006_create_quotes_table	9
35	2024_01_01_000007_create_quote_items_table	9
36	2024_01_01_000008_create_contracts_table	9
37	2024_01_01_000009_add_b2b_fields_to_products_table	9
38	2024_01_01_000010_add_b2b_fields_to_orders_table	9
39	2024_01_15_000000_add_greek_courier_fields_to_orders	9
40	2024_01_15_000001_create_shipping_tracking_events_table	9
41	2024_01_16_000000_create_invoices_table	9
42	2024_01_16_000001_create_invoice_items_table	9
43	2024_01_16_000002_create_invoice_payments_table	9
44	2025_01_25_120000_create_user_behavior_events_table	10
45	2025_01_25_120001_create_user_product_interactions_table	10
46	2025_01_25_120002_create_recommendation_logs_table	10
47	2025_01_25_120003_create_user_preference_updates_table	10
48	2025_01_25_150000_create_quickbooks_tokens_table	10
49	2025_03_28_213553_create_product_images_table	10
50	2025_03_28_213633_create_product_category_relations_table	10
51	2025_03_28_213706_create_order_items_table	10
52	2025_03_29_100001_create_shipping_zones_table	10
53	2025_03_29_100002_create_postal_code_zones_table	10
54	2025_03_29_100003_create_weight_tiers_table	10
55	2025_03_29_100004_create_delivery_methods_table	10
56	2025_03_29_100005_create_shipping_rates_table	10
57	2025_03_29_100006_create_extra_weight_charges_table	10
58	2025_03_29_100007_create_additional_charges_table	10
59	2025_03_29_100008_create_producer_shipping_methods_table	10
60	2025_03_29_100009_create_producer_shipping_rates_table	10
61	2025_03_29_100010_create_producer_free_shipping_table	10
62	2025_03_29_100011_add_shipping_columns_to_products_table	10
63	2025_03_29_100012_add_shipping_columns_to_producers_table	10
64	2025_03_29_100013_add_producer_id_to_shipping_rates_table	10
65	2025_03_30_003100_create_product_questions_table	10
66	2025_03_30_085833_create_personal_access_tokens_table	10
67	2025_04_05_140220_create_permission_tables	10
68	2025_04_05_143547_add_type_and_order_to_product_categories_table	10
69	2025_04_05_143749_create_product_attributes_table	10
70	2025_04_05_143827_create_product_attribute_values_table	10
71	2025_04_05_150446_create_carts_table	10
72	2025_04_05_150505_create_cart_items_table	10
73	2025_04_05_161612_create_notifications_table	10
74	2025_04_05_171859_create_payments_table	10
75	2025_04_05_173449_create_adoptable_items_table	10
76	2025_04_05_173459_create_adoptions_table	10
77	2025_04_05_173520_create_adoption_updates_table	10
78	2025_04_05_173531_create_adoption_plans_table	10
79	2025_04_05_173532_add_foreign_key_to_adoptions_table	10
80	2025_04_08_000002_create_settings_table	10
81	2025_04_08_000003_create_subscription_plans_table	10
82	2025_04_08_000004_create_subscriptions_table	10
83	2025_04_10_171106_add_role_to_users_table	10
84	2025_04_11_170613_create_product_cost_breakdowns_table	10
85	2025_04_18_173247_add_is_active_to_users_table	10
86	2025_04_21_163431_activate_athens_thessaloniki_shipping_zones	10
87	2025_04_21_164415_add_multi_producer_discount_to_shipping_rates	10
88	2025_04_23_163138_add_geojson_data_to_shipping_zones	10
89	2025_04_23_171942_add_geojson_and_color_to_shipping_zones	10
90	2025_04_23_172307_add_colors_to_shipping_zones	10
91	2025_04_23_182933_add_postal_code_zone_mappings	10
92	2025_04_23_183138_update_shipping_zones	10
93	2025_04_23_183441_add_shipping_zone_data	10
94	2025_04_26_131017_create_contact_messages_table	10
95	2025_04_26_140630_create_favorites_table	10
96	2025_04_29_071216_create_producer_reviews_table	10
97	2025_04_29_192402_add_coordinates_to_producers_table	10
98	2025_05_12_100000_create_producer_media_table	10
99	2025_05_12_100001_create_producer_questions_table	10
100	2025_05_12_100002_add_seasonality_to_products_table	10
101	2025_05_12_100003_create_producer_environmental_stats_table	10
102	2025_05_30_create_producer_profiles_table	10
103	2025_05_31_060553_add_status_to_products_table	10
104	2025_05_31_144214_update_payments_table_for_stripe	11
105	2025_05_31_164908_add_stripe_customer_id_to_users_table	11
106	2025_06_01_000001_create_integration_settings_table	11
107	2025_06_01_000002_create_integration_logs_table	11
108	2025_06_01_000003_add_quickbooks_fields_to_tables	11
109	2025_06_09_154703_create_categories_table	10
110	2025_06_10_065204_add_missing_fields_to_orders_table	10
111	2025_12_31_120000_add_performance_indexes_to_tables_fixed	12
112	2025_07_30_150242_add_google_oauth_fields_to_users_table	13
\.


--
-- Data for Name: model_has_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_has_permissions (permission_id, model_type, model_id) FROM stdin;
\.


--
-- Data for Name: model_has_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_has_roles (role_id, model_type, model_id) FROM stdin;
1	App\\Models\\User	7
1	App\\Models\\User	8
1	App\\Models\\User	9
1	App\\Models\\User	10
1	App\\Models\\User	11
1	App\\Models\\User	21
1	App\\Models\\User	22
1	App\\Models\\User	23
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, data, is_read, read_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, producer_id, quantity, price, subtotal, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, business_id, status, total_amount, shipping_cost, tax_amount, discount_amount, shipping_address_id, billing_address_id, payment_method, payment_status, notes, created_at, updated_at, tenant_id, business_user_id, quote_id, contract_id, order_type, payment_terms, payment_due_date, credit_used, b2b_notes, shipping_provider, tracking_number, shipping_service_type, actual_shipping_cost, shipped_at, delivered_at, shipping_metadata, quickbooks_invoice_id, quickbooks_synced_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, transaction_id, status, payment_gateway, amount, stripe_data, created_at, updated_at, stripe_payment_intent_id, currency) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, guard_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
1	App\\Models\\User	8	auth_token	6a0b6e48dd369c27faa53d8a4dac179e28fa2522d46322d714123361c393bebc	["*"]	\N	\N	2025-07-23 21:40:22	2025-07-23 21:40:22
2	App\\Models\\User	9	auth_token	e320d74eaecd46aa39ea2ad6513953d7542963c0efb00a50333f513bbd742782	["*"]	\N	\N	2025-07-23 22:05:57	2025-07-23 22:05:57
3	App\\Models\\User	10	auth_token	60a85f3b06b2f00e789d60b94c5b93a29148078c1b7429264467d31191f2d0ad	["*"]	\N	\N	2025-07-24 03:59:10	2025-07-24 03:59:10
4	App\\Models\\User	10	auth_token	89dcdd512e82884984da9e28a8ba8402b2d592f34dd9bb8edffbe079e8cd876c	["*"]	\N	\N	2025-07-24 03:59:50	2025-07-24 03:59:50
5	App\\Models\\User	11	auth_token	f27e8d7dbb678d73647f117c39a983a0a886fc15c5e4730e6396f92700b76a18	["*"]	\N	\N	2025-07-24 04:00:45	2025-07-24 04:00:45
6	App\\Models\\User	11	auth_token	4e95cf09b937c26b462a3d9c86e3fff047bc2a4f6426cdb91794cf0c8372261f	["*"]	2025-07-24 04:03:09	\N	2025-07-24 04:00:52	2025-07-24 04:03:09
7	App\\Models\\User	12	auth_token	7525c548aff536ca856477ebdf5a70ae7e3972f665076753c7f3f03ee4e1f658	["*"]	\N	\N	2025-07-24 04:58:37	2025-07-24 04:58:37
8	App\\Models\\User	21	auth_token	01a1001a32284f016068e4f5c9bd763e95c9104c8cd3d0e02966a6d8b958f642	["*"]	\N	\N	2025-07-24 17:43:05	2025-07-24 17:43:05
9	App\\Models\\User	22	auth_token	0f15d99fcb896604c0d7eb658a5a9c57fcb763a6389a08b10d5a18d123637f41	["*"]	\N	\N	2025-07-24 17:54:31	2025-07-24 17:54:31
10	App\\Models\\User	23	auth_token	622fc81e47419dedf5c36b72e5db422adfb5b47f069b0e07643baee76f4f951d	["*"]	\N	\N	2025-07-24 20:08:19	2025-07-24 20:08:19
\.


--
-- Data for Name: postal_code_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.postal_code_zones (id, postal_code_prefix, shipping_zone_id) FROM stdin;
1	104	6
2	105	6
3	106	6
4	107	6
5	108	6
6	109	6
7	110	6
8	111	6
9	112	6
10	113	6
11	114	6
12	115	6
13	116	6
14	117	6
15	118	6
16	119	6
17	546	7
18	547	7
19	548	7
20	549	7
21	550	7
22	551	7
23	552	7
24	553	7
25	554	7
26	555	7
27	556	7
28	557	7
29	558	7
30	559	7
31	560	7
32	561	7
33	562	7
34	563	7
35	564	7
36	565	7
37	566	7
38	567	7
39	568	7
40	569	7
\.


--
-- Data for Name: producer_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_documents (id, producer_id, name, file_path, type, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: producer_environmental_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_environmental_stats (id, producer_id, distance, co2_saved, water_saved, packaging_saved, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: producer_free_shipping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_free_shipping (id, producer_id, shipping_zone_id, delivery_method_id, free_shipping_threshold, is_active) FROM stdin;
1	6	\N	\N	50.00	t
2	7	\N	\N	50.00	t
3	8	\N	\N	50.00	t
\.


--
-- Data for Name: producer_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_media (id, producer_id, type, file_path, title, description, "order", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: producer_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_profiles (id, user_id, business_name, business_registration_number, tax_number, description, specialties, location_address, location_city, location_region, location_postal_code, location_lat, location_lng, website_url, social_media, farm_photos, certification_documents, verification_status, verification_notes, trust_level, admin_notes, verified_at, verified_by, payment_terms_days, minimum_order_amount, delivery_zones, processing_time_days, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: producer_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_questions (id, producer_id, user_id, question, answer, is_public, answered_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: producer_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_reviews (id, user_id, producer_id, rating, title, comment, is_approved, is_verified_customer, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: producer_shipping_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_shipping_methods (id, producer_id, delivery_method_id, is_enabled) FROM stdin;
\.


--
-- Data for Name: producer_shipping_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_shipping_rates (id, producer_id, shipping_zone_id, weight_tier_id, delivery_method_id, price) FROM stdin;
\.


--
-- Data for Name: producers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producers (id, user_id, business_name, tax_id, tax_office, description, address, city, postal_code, region, logo, cover_image, website, social_media, bio, verified, rating, created_at, updated_at, tenant_id, uses_custom_shipping_rates, latitude, longitude, map_description) FROM stdin;
1	1	Ελαιώνες Καλαμάτας	\N	\N	Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.	Καλαμάτα, Μεσσηνία	Καλαμάτα	\N	Πελοπόννησος	\N	\N	\N	\N	Οικογενειακή επιχείρηση με παράδοση 3 γενεών στην παραγωγή premium ελαιολάδου.	t	4.90	2025-07-23 12:45:19	2025-07-23 12:45:19	\N	f	\N	\N	\N
2	2	Μελισσοκομείο Χαλκιδικής	\N	\N	Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.	Πολύγυρος, Χαλκιδική	Πολύγυρος	\N	Μακεδονία	\N	\N	\N	\N	Φυσικό μέλι από βουνά της Χαλκιδικής, συλλεγμένο με παραδοσιακές μεθόδους.	t	5.00	2025-07-23 12:45:19	2025-07-23 12:45:19	\N	f	\N	\N	\N
3	3	Αμπελώνες Νεμέας	\N	\N	Παραγωγή εκλεκτών κρασιών από τους αμπελώνες της Νεμέας.	Νεμέα, Κορινθία	Νεμέα	\N	Πελοπόννησος	\N	\N	\N	\N	Οινοποιείο με ιστορία που χάνεται στους αιώνες, παραγωγή premium κρασιών.	t	4.80	2025-07-23 12:45:19	2025-07-23 12:45:19	\N	f	\N	\N	\N
4	4	Τυροκομείο Κρήτης	\N	\N	Παραδοσιακά κρητικά τυριά από κατσικίσιο και πρόβειο γάλα.	Χανιά, Κρήτη	Χανιά	\N	Κρήτη	\N	\N	\N	\N	Τυροκομείο που διατηρεί τις παραδοσιακές συνταγές της κρητικής γης.	t	4.70	2025-07-23 12:45:19	2025-07-23 12:45:19	\N	f	\N	\N	\N
5	5	Αγρόκτημα Θεσσαλίας	\N	\N	Φρέσκα λαχανικά και φρούτα από τον κάμπο της Θεσσαλίας.	Λάρισα, Θεσσαλία	Λάρισα	\N	Θεσσαλία	\N	\N	\N	\N	Βιολογική καλλιέργεια φρούτων και λαχανικών με σεβασμό στο περιβάλλον.	t	4.60	2025-07-23 12:45:19	2025-07-23 12:45:19	\N	f	\N	\N	\N
6	18	Ελαιώνες Καλαμάτας	\N	\N	Παραγωγή εξαιρετικού παρθένου ελαιόλαδου από τους ελαιώνες της Καλαμάτας.	\N	Καλαμάτα	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-07-24 06:20:52	2025-07-24 06:20:52	\N	t	\N	\N	\N
7	19	Αμπελώνες Νεμέας	\N	\N	Παραγωγή εκλεκτών κρασιών από τους αμπελώνες της Νεμέας.	\N	Νεμέα	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-07-24 06:20:53	2025-07-24 06:20:53	\N	t	\N	\N	\N
8	20	Μελισσοκομείο Χαλκιδικής	\N	\N	Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.	\N	Χαλκιδική	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-07-24 06:20:53	2025-07-24 06:20:53	\N	t	\N	\N	\N
\.


--
-- Data for Name: product_attribute_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_attribute_values (id, product_id, attribute_id, value, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_attributes (id, name, slug, type, options, description, is_filterable, is_required, is_active, "order", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_categories (id, name, slug, parent_id, description, image, is_active, created_at, updated_at, type, "order") FROM stdin;
\.


--
-- Data for Name: product_category_relations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_category_relations (id, product_id, category_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_cost_breakdowns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_cost_breakdowns (id, product_id, producer_cost, packaging_cost, producer_profit_target, platform_fee_percentage, shipping_estimate, taxes_estimate, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, image_path, sort_order, alt_text, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_questions (id, product_id, user_id, question, answer, answered_by_producer_id, is_public, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, producer_id, name, slug, description, short_description, price, discount_price, stock, sku, weight_grams, dimensions, main_image, is_active, is_featured, is_seasonal, season_start, season_end, is_limited_edition, limited_quantity, allow_wishlist_notifications, attributes, created_at, updated_at, tenant_id, b2b_available, wholesale_price, min_order_quantity, max_order_quantity, bulk_discount_threshold, bulk_discount_percentage, b2b_description, b2b_specifications, category_id, length_cm, width_cm, height_cm, is_perishable, is_fragile, seasonality, status, is_organic, is_vegan, is_gluten_free, weight, stock_quantity, quickbooks_item_id, quickbooks_synced_at) FROM stdin;
8	5	Μήλα Ζαγοράς	mila-zaghoras	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		4.50	\N	191	SKU-8	1773	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:40	\N	f	\N	1	\N	\N	\N	\N	\N	1	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
9	5	Κεράσια Ροδοχωρίου	kerasia-rodokhorioy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		12.00	\N	93	SKU-9	1999	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:40	\N	f	\N	1	\N	\N	\N	\N	\N	1	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
10	5	Ακτινίδια Πιερίας	aktinidia-pierias	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		5.80	\N	115	SKU-10	246	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:40	\N	f	\N	1	\N	\N	\N	\N	\N	1	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
11	5	Ροδάκινα Νάουσας	rodakina-naoysas	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		3.90	\N	92	SKU-11	1607	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:40	\N	f	\N	1	\N	\N	\N	\N	\N	1	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
3	8	Μέλι Θυμαρίσιο	meli-thymarisio	Θυμαρίσιο μέλι από την Κρήτη		7.99	\N	30	SKU-3	500	\N	\N	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 20:42:15	\N	f	\N	1	\N	\N	\N	\N	\N	11	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
12	1	Βερίκοκα Αργολίδας	berikoka-argholidas	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		4.20	\N	164	SKU-12	1620	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	1	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
14	1	Αχλάδια Τριπόλεως	akhladia-tripoleos	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		3.80	\N	81	SKU-14	1198	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	1	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
16	1	Βιολογικές Ντομάτες Καλαμάτας	biologhikes-ntomates-kalamatas	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		3.50	\N	122	SKU-16	1068	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	2	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
17	1	Κολοκυθάκια Κρήτης	kolokithakia-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		2.80	\N	100	SKU-17	1229	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	2	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
18	1	Αγγούρια Θεσσαλίας	aghghouria-thessalias	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		2.20	\N	57	SKU-18	778	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	2	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
19	1	Πιπεριές Φλωρίνης	piperies-florinis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		4.50	\N	174	SKU-19	398	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	2	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
20	1	Μελιτζάνες Τσακώνικες	melitzanes-tsakwnikes	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		3.20	\N	142	SKU-20	1553	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	2	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
21	1	Κρεμμύδια Σκοπέλου	kremmydia-skopeloy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		1.80	\N	97	SKU-21	614	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	2	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
22	1	Πατάτες Νάξου	patates-naksoy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		2.50	\N	95	SKU-22	1994	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	2	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
23	1	Καρότα Κρήτης	karota-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		2.10	\N	194	SKU-23	385	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	2	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
13	7	Σταφύλια Κορινθίας	stafylia-korinthias	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		6.50	\N	156	SKU-13	372	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	1	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
7	5	Λεμόνια Αργολίδας	lemonia-argholidas	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		3.20	\N	193	SKU-7	1062	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:40	\N	f	\N	1	\N	\N	\N	\N	\N	1	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
1	6	Ελιές Καλαμών	elies-kalamwn	Ελιές Καλαμών από την Μεσσηνία		5.99	\N	98	SKU-1	500	\N	\N	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 20:42:15	\N	f	\N	1	\N	\N	\N	\N	\N	10	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
2	6	Ελαιόλαδο Εξαιρετικό Παρθένο	elaiolado-exairetiko-partheno	Εξαιρετικό παρθένο ελαιόλαδο από την Μεσσηνία		9.99	\N	50	SKU-2	500	\N	\N	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 20:42:15	\N	f	\N	1	\N	\N	\N	\N	\N	9	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
4	4	Φέτα ΠΟΠ	feta-pop	Φέτα ΠΟΠ από αιγοπρόβειο γάλα		8.99	\N	40	SKU-4	500	\N	\N	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 20:42:15	\N	f	\N	1	\N	\N	\N	\N	\N	12	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
5	7	Κρασί Αγιωργίτικο	krasi-agiorgitiko	Αγιωργίτικο κρασί από την Νεμέα		12.99	\N	20	SKU-5	500	\N	\N	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 20:50:16	\N	f	\N	1	\N	\N	\N	\N	\N	14	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
25	1	Μαρούλι Παγόβουνο	marouli-paghovoyno	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		1.50	\N	75	SKU-25	1714	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	2	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
26	1	Βιολογικό Ελαιόλαδο Καλαμάτας	biologhiko-elaiolado-kalamatas	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		12.50	\N	56	SKU-26	1718	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	3	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
27	1	Εξαιρετικό Παρθένο Κρήτης	eksairetiko-partheno-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		15.80	\N	186	SKU-27	845	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	3	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
28	1	Ελαιόλαδο Κορωνείας	elaiolado-koronias	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		11.20	\N	82	SKU-28	362	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	3	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
29	1	Βιολογικό Λάδι Λέσβου	biologhiko-ladi-lesvoy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		14.50	\N	109	SKU-29	1650	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	3	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
30	1	Παρθένο Ελαιόλαδο Χίου	partheno-elaiolado-xioy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		13.90	\N	75	SKU-30	1730	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	3	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
31	1	Ελαιόλαδο Μάνης	elaiolado-manis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		16.20	\N	118	SKU-31	1417	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	3	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
32	1	Βιολογικό Λάδι Ζακύνθου	biologhiko-ladi-zakynthoy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		12.80	\N	162	SKU-32	409	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	3	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
33	1	Εξαιρετικό Λάδι Αμφίσσης	eksairetiko-ladi-amfissis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		14.20	\N	83	SKU-33	324	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	3	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
34	1	Παρθένο Λάδι Αίγινας	partheno-ladi-aighinas	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		15.50	\N	163	SKU-34	360	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	3	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
35	1	Ελαιόλαδο Μυτιλήνης	elaiolado-mitilinis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		13.20	\N	179	SKU-35	254	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	3	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
43	4	Κατσικίσιο Τυρί Μήλου	katsikisio-tiri-miloy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		11.50	\N	113	SKU-43	1872	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:40	\N	f	\N	1	\N	\N	\N	\N	\N	4	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
37	1	Κασέρι Κρήτης	kaseri-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		12.50	\N	72	SKU-37	1153	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	4	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
38	1	Γραβιέρα Νάξου	graviera-naksoy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		15.80	\N	148	SKU-38	293	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	4	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
39	1	Κεφαλοτύρι Κρήτης	kefalotyri-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		14.20	\N	91	SKU-39	365	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	4	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
40	1	Μυζήθρα Κρήτης	mizithra-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		6.50	\N	180	SKU-40	1487	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	4	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
41	1	Ανθότυρο Κρήτης	anthotiro-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		7.80	\N	151	SKU-41	1880	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	4	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
42	1	Μανούρι Κρήτης	manouri-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		9.20	\N	138	SKU-42	1983	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	4	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
36	4	Φέτα ΠΟΠ Μετσόβου	feta-pop-metsovoy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		8.90	\N	133	SKU-36	989	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:40	\N	f	\N	1	\N	\N	\N	\N	\N	4	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
45	1	Λαδοτύρι Μυτιλήνης	ladotyri-mitilinis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		16.20	\N	70	SKU-45	263	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	4	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
47	8	Μέλι Θυμαρίσιο Κρήτης	meli-thimarisio-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		18.50	\N	127	SKU-47	901	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	5	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
48	8	Μέλι Πεύκου Εύβοιας	meli-peukoy-euvoias	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		16.80	\N	147	SKU-48	1993	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	5	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
49	8	Μέλι Ανθέων Νάξου	meli-antheon-naksoy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		12.20	\N	54	SKU-49	1138	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	5	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
50	8	Μέλι Κάστανου Πηλίου	meli-kastanoy-pilioy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		14.50	\N	165	SKU-50	1526	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	5	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
51	8	Μέλι Ερείκης Κρήτης	meli-erikis-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		19.80	\N	66	SKU-51	910	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	5	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
52	8	Μέλι Πορτοκαλιάς Αργολίδας	meli-portokalias-argholidas	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		13.90	\N	150	SKU-52	370	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	5	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
53	8	Μέλι Λεβάντας Χίου	meli-levantas-xioy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		22.50	\N	180	SKU-53	1541	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	5	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
54	8	Μέλι Δάσους Ροδόπης	meli-dasoys-rodopis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		17.20	\N	54	SKU-54	1369	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	5	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
55	8	Μέλι Βουνού Ολύμπου	meli-boynou-olympoy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		20.80	\N	122	SKU-55	1597	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	5	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
60	8	Μέλι Θυμαρίσιο Κρήτης	meli-thymarisio-kritis	Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης. Πλούσιο σε αντιοξειδωτικά και θρεπτικά συστατικά.	Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης	18.00	\N	60	SKU-60	450	\N	https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	11	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
57	1	Βιολογικό Ελαιόλαδο Καλαμών	viologiko-elaiolado-kalamon	Βιολογικό εξτραπάρθενο ελαιόλαδο από ελιές Καλαμών. Πιστοποιημένο βιολογικό προϊόν με έντονο άρωμα και γεύση.	Βιολογικό ελαιόλαδο Καλαμών, πιστοποιημένο	15.80	\N	80	SKU-57	750	\N	https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	9	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
58	1	Ελιές Καλαμών Εξαιρετικές	elies-kalamon-exairetikes	Εκλεκτές ελιές Καλαμών, μεγάλου μεγέθους, παραδοσιακής επεξεργασίας. Ιδανικές για μεζέδες και σαλάτες.	Εκλεκτές ελιές Καλαμών μεγάλου μεγέθους	8.90	\N	200	SKU-58	400	\N	https://images.unsplash.com/photo-1611171711912-e0be6da4e3c4?w=500&h=500&fit=crop	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	10	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
59	1	Ελιές Χαλκιδικής Γεμιστές	elies-xalkidikis-gemistes	Πράσινες ελιές Χαλκιδικής γεμιστές με αμύγδαλο. Τραγανές και νόστιμες, ιδανικές για απεριτίφ.	Πράσινες ελιές Χαλκιδικής γεμιστές με αμύγδαλο	6.50	\N	120	SKU-59	350	\N	https://images.unsplash.com/photo-1605207616227-7c4b6b5b3b8a?w=500&h=500&fit=crop	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	10	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
61	8	Μέλι Πεύκου Εύβοιας	meli-peukoy-evvoias	Σπάνιο μέλι πεύκου από τα δάση της Εύβοιας. Σκούρο χρώμα, έντονη γεύση και υψηλή θρεπτική αξία.	Σπάνιο μέλι πεύκου από τα δάση της Εύβοιας	22.50	\N	40	SKU-61	450	\N	https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&h=500&fit=crop	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	11	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
46	8	Μέλι Ελάτης Αρκαδίας	meli-elatis-arkadias	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		15.00	\N	82	SKU-46	643	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:28	\N	f	\N	1	\N	\N	\N	\N	\N	5	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
15	1	Καρπούζια Τυρνάβου	karpouzia-tirnavoy	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		1.20	\N	62	SKU-15	1181	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	1	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
24	1	Σπανάκι Βιολογικό	spanaki-biologhiko	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		3.80	\N	72	SKU-24	1474	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	2	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
44	1	Φορμαέλλα Αράχωβας	formaella-arakhovas	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		13.80	\N	172	SKU-44	1260	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	4	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
56	1	Εξτραπάρθενο Ελαιόλαδο Κορωνέικη	extraparteno-elaiolado-koroneiki	Εξαιρετικής ποιότητας εξτραπάρθενο ελαιόλαδο από ελιές Κορωνέικη. Ψυχρή εκχύλιση, χαμηλή οξύτητα 0.2%. Ιδανικό για σαλάτες και μαγείρεμα.	Εξτραπάρθενο ελαιόλαδο Κορωνέικη, ψυχρή εκχύλιση	12.50	\N	150	SKU-56	500	\N	https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	9	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
66	1	Premium Ελαιόλαδο Καλαμάτας	premium-olive-oil-kalamata	Εξαιρετικό παρθένο ελαιόλαδο από τους ελαιώνες της Καλαμάτας	\N	15.99	\N	0	\N	\N	\N	\N	t	t	f	\N	\N	f	\N	t	\N	2025-07-25 23:14:51	2025-07-25 23:14:51	\N	f	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
63	1	Κασέρι Μετσόβου ΠΟΠ	kaseri-metsovoy-pop	Αυθεντικό κασέρι Μετσόβου ΠΟΠ από αιγοπρόβειο γάλα. Σκληρό τυρί με έντονη γεύση και άρωμα.	Αυθεντικό κασέρι Μετσόβου ΠΟΠ	19.80	\N	50	SKU-63	300	\N	https://images.unsplash.com/photo-1452195100486-9cc805987862?w=500&h=500&fit=crop	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	12	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
64	1	Ντομάτες Σαντορίνης	ntomates-santorinis	Μικρές γλυκές ντομάτες από τη Σαντορίνη. Εξαιρετική γεύση λόγω του ηφαιστειογενούς εδάφους.	Μικρές γλυκές ντομάτες από τη Σαντορίνη	7.50	\N	80	SKU-64	500	\N	https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500&h=500&fit=crop	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-23 12:56:41	\N	f	\N	1	\N	\N	\N	\N	\N	14	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
67	2	Φυσικό Μέλι Χαλκιδικής	natural-honey-halkidiki	Αγνό μέλι από τα βουνά της Χαλκιδικής	\N	12.50	\N	0	\N	\N	\N	\N	t	t	f	\N	\N	f	\N	t	\N	2025-07-25 23:14:51	2025-07-25 23:14:51	\N	f	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
62	4	Φέτα ΠΟΠ Δωδεκανήσου	feta-pop-dodekanisoy	Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα. Κρεμώδης υφή, αλμυρή γεύση, ιδανική για ελληνική σαλάτα.	Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα	14.20	\N	90	SKU-62	400	\N	https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:40	\N	f	\N	1	\N	\N	\N	\N	\N	12	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
6	5	Πορτοκάλια Βαλέντσια Κρήτης	portokalia-balentsia-kritis	Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.		2.50	\N	193	SKU-6	1190	\N	https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500	t	f	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:40	\N	f	\N	1	\N	\N	\N	\N	\N	1	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
65	5	Πορτοκάλια Αργολίδας	portokalia-argolidas	Φρέσκα πορτοκάλια από τους κήπους της Αργολίδας. Ζουμερά και γλυκά, πλούσια σε βιταμίνη C.	Φρέσκα πορτοκάλια από την Αργολίδα	3.20	\N	200	SKU-65	1000	\N	https://images.unsplash.com/photo-1547514701-42782101795e?w=500&h=500&fit=crop	t	t	f	\N	\N	f	\N	t	\N	2025-07-23 12:49:20	2025-07-24 06:21:40	\N	f	\N	1	\N	\N	\N	\N	\N	14	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
68	3	Κρασί Αμπελώνων Νεμέας	wine-nemea-vineyards	Premium κρασί από τους αμπελώνες της Νεμέας	\N	22.00	\N	0	\N	\N	\N	\N	t	t	f	\N	\N	f	\N	t	\N	2025-07-25 23:14:51	2025-07-25 23:14:51	\N	f	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
69	4	Γραβιέρα Κρήτης	graviera-crete	Παραδοσιακό κρητικό τυρί από κατσικίσιο γάλα	\N	18.75	\N	0	\N	\N	\N	\N	t	t	f	\N	\N	f	\N	t	\N	2025-07-25 23:14:51	2025-07-25 23:14:51	\N	f	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
70	5	Βιολογικές Ντομάτες Θεσσαλίας	organic-tomatoes-thessaly	Φρέσκες βιολογικές ντομάτες από τον κάμπο της Θεσσαλίας	\N	3.20	\N	0	\N	\N	\N	\N	t	f	f	\N	\N	f	\N	t	\N	2025-07-25 23:14:51	2025-07-25 23:14:51	\N	f	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	pending	f	f	f	\N	0	\N	\N
\.


--
-- Data for Name: quickbooks_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quickbooks_tokens (id, user_id, access_token, refresh_token, company_id, expires_at, company_info, last_sync, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quote_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_items (id, quote_id, product_id, quantity, unit_price, total_price, discount_percentage, discount_amount, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotes (id, tenant_id, business_user_id, quote_number, title, description, status, subtotal, discount_amount, discount_percentage, tax_amount, total_amount, currency, valid_until, terms_and_conditions, notes, created_by, approved_by, approved_at, converted_to_order_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: recommendation_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recommendation_logs (id, user_id, product_ids, algorithm, context, metadata, served_at, clicked_at, clicked_product_id, position_clicked, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: revenue_shares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revenue_shares (id, tenant_id, order_id, transaction_type, gross_amount, commission_rate, commission_amount, net_amount, platform_fee, payment_processor_fee, status, processed_at, payout_date, payout_reference, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, user_id, product_id, rating, title, comment, is_approved, is_verified_purchase, created_at, updated_at, tenant_id) FROM stdin;
\.


--
-- Data for Name: role_has_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_has_permissions (permission_id, role_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, guard_name, created_at, updated_at) FROM stdin;
1	consumer	web	2025-07-23 21:10:42	2025-07-23 21:10:42
2	producer	web	2025-07-23 21:10:42	2025-07-23 21:10:42
3	business_user	web	2025-07-23 21:10:42	2025-07-23 21:10:42
4	admin	web	2025-07-23 21:10:42	2025-07-23 21:10:42
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, type, "group", description, created_at, updated_at) FROM stdin;
1	site_name	"Dixis"	string	general	The name of the site	\N	\N
2	site_description	"\\u03a0\\u03bb\\u03b1\\u03c4\\u03c6\\u03cc\\u03c1\\u03bc\\u03b1 \\u03b1\\u03b3\\u03bf\\u03c1\\u03ac\\u03c2 \\u03c0\\u03c1\\u03bf\\u03ca\\u03cc\\u03bd\\u03c4\\u03c9\\u03bd \\u03b1\\u03c0\\u03b5\\u03c5\\u03b8\\u03b5\\u03af\\u03b1\\u03c2 \\u03b1\\u03c0\\u03cc \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03c9\\u03b3\\u03bf\\u03cd\\u03c2"	string	general	The description of the site	\N	\N
3	contact_email	"info@dixis.gr"	string	contact	The contact email of the site	\N	\N
4	contact_phone	"+30 210 1234567"	string	contact	The contact phone of the site	\N	\N
5	social_media	{"facebook":"https:\\/\\/facebook.com\\/dixis","instagram":"https:\\/\\/instagram.com\\/dixis","twitter":"https:\\/\\/twitter.com\\/dixis"}	json	social	Social media links	\N	\N
6	commission_rate	10	integer	financial	The commission rate for producers (percentage)	\N	\N
7	vat_rate	24	integer	financial	The VAT rate (percentage)	\N	\N
8	enable_producer_registration	true	boolean	registration	Enable producer registration	\N	\N
9	enable_business_registration	true	boolean	registration	Enable business registration	\N	\N
10	enable_consumer_registration	true	boolean	registration	Enable consumer registration	\N	\N
\.


--
-- Data for Name: shipping_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_rates (id, shipping_zone_id, weight_tier_id, delivery_method_id, price, multi_producer_discount, min_producers_for_discount) FROM stdin;
\.


--
-- Data for Name: shipping_tracking_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_tracking_events (id, tracking_number, provider, event_type, event_description, location, event_timestamp, raw_data, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: shipping_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_zones (id, name, description, geojson, color, is_active, created_at, updated_at) FROM stdin;
1	Αστικά Κέντρα (Αθήνα/Θεσσαλονίκη)	Περιλαμβάνει τις περιοχές της Αθήνας και της Θεσσαλονίκης.	{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[23.6,37.9],[23.8,37.9],[23.8,38.1],[23.6,38.1],[23.6,37.9]]]}}	#4299E1	t	2025-07-23 15:09:22	2025-07-23 15:09:22
2	Πρωτεύουσες Νομών Ηπειρωτικής Ελλάδας	Περιλαμβάνει τις πρωτεύουσες των νομών της ηπειρωτικής Ελλάδας.	{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[21.7,38.2],[22.0,38.2],[22.0,38.5],[21.7,38.5],[21.7,38.2]]]}}	#48BB78	t	2025-07-23 15:09:22	2025-07-23 15:09:22
3	Λοιπή Ηπειρωτική Ελλάδα & Εύβοια	Περιλαμβάνει την υπόλοιπη ηπειρωτική Ελλάδα και την Εύβοια.	{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[21.0,38.0],[23.0,38.0],[23.0,41.0],[21.0,41.0],[21.0,38.0]]]}}	#ECC94B	t	2025-07-23 15:09:22	2025-07-23 15:09:22
4	Νησιά (Εξαιρουμένων Δυσπρόσιτων)	Περιλαμβάνει τα νησιά, εκτός από τις δυσπρόσιτες περιοχές.	{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[24.0,35.0],[26.0,35.0],[26.0,37.0],[24.0,37.0],[24.0,35.0]]]}}	#ED8936	t	2025-07-23 15:09:22	2025-07-23 15:09:22
5	Δυσπρόσιτες Περιοχές	Περιλαμβάνει τις δυσπρόσιτες περιοχές της ηπειρωτικής και νησιωτικής Ελλάδας.	{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[27.0,36.0],[28.0,36.0],[28.0,37.0],[27.0,37.0],[27.0,36.0]]]}}	#E53E3E	t	2025-07-23 15:09:22	2025-07-23 15:09:22
6	Αθήνα	Περιλαμβάνει την περιοχή της Αθήνας.	{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[23.7,37.95],[23.75,37.95],[23.75,38.0],[23.7,38.0],[23.7,37.95]]]}}	#805AD5	t	2025-07-23 15:09:22	2025-07-23 15:09:22
7	Θεσσαλονίκη	Περιλαμβάνει την περιοχή της Θεσσαλονίκης.	{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[22.9,40.6],[23.0,40.6],[23.0,40.7],[22.9,40.7],[22.9,40.6]]]}}	#3182CE	t	2025-07-23 15:09:22	2025-07-23 15:09:22
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, target_type, price, billing_cycle, duration_months, commission_rate, features, is_active, created_at, updated_at) FROM stdin;
1	Βασικό Πακέτο Παραγωγού	producer	19.99	monthly	1	10.00	["\\u0388\\u03c9\\u03c2 20 \\u03c0\\u03c1\\u03bf\\u03ca\\u03cc\\u03bd\\u03c4\\u03b1","\\u0392\\u03b1\\u03c3\\u03b9\\u03ba\\u03ae \\u03c0\\u03c1\\u03bf\\u03b2\\u03bf\\u03bb\\u03ae \\u03c3\\u03c4\\u03b7\\u03bd \\u03c0\\u03bb\\u03b1\\u03c4\\u03c6\\u03cc\\u03c1\\u03bc\\u03b1","\\u03a0\\u03c1\\u03cc\\u03c3\\u03b2\\u03b1\\u03c3\\u03b7 \\u03c3\\u03c4\\u03bf dashboard \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03c9\\u03b3\\u03bf\\u03cd","Email \\u03c5\\u03c0\\u03bf\\u03c3\\u03c4\\u03ae\\u03c1\\u03b9\\u03be\\u03b7"]	t	2025-07-23 15:09:22	2025-07-23 15:09:22
2	Premium Πακέτο Παραγωγού	producer	39.99	monthly	1	8.00	["\\u0391\\u03c0\\u03b5\\u03c1\\u03b9\\u03cc\\u03c1\\u03b9\\u03c3\\u03c4\\u03b1 \\u03c0\\u03c1\\u03bf\\u03ca\\u03cc\\u03bd\\u03c4\\u03b1","\\u03a0\\u03c1\\u03bf\\u03c4\\u03b5\\u03c1\\u03b1\\u03b9\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1 \\u03c3\\u03c4\\u03b7\\u03bd \\u03b1\\u03bd\\u03b1\\u03b6\\u03ae\\u03c4\\u03b7\\u03c3\\u03b7","\\u03a0\\u03c1\\u03bf\\u03b2\\u03bf\\u03bb\\u03ae \\u03c3\\u03c4\\u03b7\\u03bd \\u03b1\\u03c1\\u03c7\\u03b9\\u03ba\\u03ae \\u03c3\\u03b5\\u03bb\\u03af\\u03b4\\u03b1","\\u03a0\\u03c1\\u03cc\\u03c3\\u03b2\\u03b1\\u03c3\\u03b7 \\u03c3\\u03c4\\u03bf dashboard \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03c9\\u03b3\\u03bf\\u03cd","\\u03a0\\u03c1\\u03bf\\u03c4\\u03b5\\u03c1\\u03b1\\u03b9\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1 \\u03c3\\u03c4\\u03b7\\u03bd \\u03c5\\u03c0\\u03bf\\u03c3\\u03c4\\u03ae\\u03c1\\u03b9\\u03be\\u03b7","\\u03a4\\u03b7\\u03bb\\u03b5\\u03c6\\u03c9\\u03bd\\u03b9\\u03ba\\u03ae \\u03c5\\u03c0\\u03bf\\u03c3\\u03c4\\u03ae\\u03c1\\u03b9\\u03be\\u03b7"]	t	2025-07-23 15:09:22	2025-07-23 15:09:22
3	Ετήσιο Πακέτο Παραγωγού	producer	199.99	annually	12	7.00	["\\u0391\\u03c0\\u03b5\\u03c1\\u03b9\\u03cc\\u03c1\\u03b9\\u03c3\\u03c4\\u03b1 \\u03c0\\u03c1\\u03bf\\u03ca\\u03cc\\u03bd\\u03c4\\u03b1","\\u03a0\\u03c1\\u03bf\\u03c4\\u03b5\\u03c1\\u03b1\\u03b9\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1 \\u03c3\\u03c4\\u03b7\\u03bd \\u03b1\\u03bd\\u03b1\\u03b6\\u03ae\\u03c4\\u03b7\\u03c3\\u03b7","\\u03a0\\u03c1\\u03bf\\u03b2\\u03bf\\u03bb\\u03ae \\u03c3\\u03c4\\u03b7\\u03bd \\u03b1\\u03c1\\u03c7\\u03b9\\u03ba\\u03ae \\u03c3\\u03b5\\u03bb\\u03af\\u03b4\\u03b1","\\u03a0\\u03c1\\u03cc\\u03c3\\u03b2\\u03b1\\u03c3\\u03b7 \\u03c3\\u03c4\\u03bf dashboard \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03c9\\u03b3\\u03bf\\u03cd","\\u03a0\\u03c1\\u03bf\\u03c4\\u03b5\\u03c1\\u03b1\\u03b9\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1 \\u03c3\\u03c4\\u03b7\\u03bd \\u03c5\\u03c0\\u03bf\\u03c3\\u03c4\\u03ae\\u03c1\\u03b9\\u03be\\u03b7","\\u03a4\\u03b7\\u03bb\\u03b5\\u03c6\\u03c9\\u03bd\\u03b9\\u03ba\\u03ae \\u03c5\\u03c0\\u03bf\\u03c3\\u03c4\\u03ae\\u03c1\\u03b9\\u03be\\u03b7","\\u0388\\u03ba\\u03c0\\u03c4\\u03c9\\u03c3\\u03b7 2 \\u03bc\\u03b7\\u03bd\\u03ce\\u03bd"]	t	2025-07-23 15:09:22	2025-07-23 15:09:22
4	Βασικό Πακέτο Επιχείρησης	business	29.99	monthly	1	\N	["\\u03a0\\u03c1\\u03cc\\u03c3\\u03b2\\u03b1\\u03c3\\u03b7 \\u03c3\\u03b5 \\u03cc\\u03bb\\u03bf\\u03c5\\u03c2 \\u03c4\\u03bf\\u03c5\\u03c2 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03c9\\u03b3\\u03bf\\u03cd\\u03c2","\\u0388\\u03c9\\u03c2 10 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03b3\\u03b5\\u03bb\\u03af\\u03b5\\u03c2 \\u03b1\\u03bd\\u03ac \\u03bc\\u03ae\\u03bd\\u03b1","\\u0392\\u03b1\\u03c3\\u03b9\\u03ba\\u03ae \\u03c0\\u03c1\\u03bf\\u03c4\\u03b5\\u03c1\\u03b1\\u03b9\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1 \\u03c3\\u03c4\\u03b9\\u03c2 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03b3\\u03b5\\u03bb\\u03af\\u03b5\\u03c2","Email \\u03c5\\u03c0\\u03bf\\u03c3\\u03c4\\u03ae\\u03c1\\u03b9\\u03be\\u03b7"]	t	2025-07-23 15:09:22	2025-07-23 15:09:22
5	Premium Πακέτο Επιχείρησης	business	59.99	monthly	1	\N	["\\u03a0\\u03c1\\u03cc\\u03c3\\u03b2\\u03b1\\u03c3\\u03b7 \\u03c3\\u03b5 \\u03cc\\u03bb\\u03bf\\u03c5\\u03c2 \\u03c4\\u03bf\\u03c5\\u03c2 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03c9\\u03b3\\u03bf\\u03cd\\u03c2","\\u0391\\u03c0\\u03b5\\u03c1\\u03b9\\u03cc\\u03c1\\u03b9\\u03c3\\u03c4\\u03b5\\u03c2 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03b3\\u03b5\\u03bb\\u03af\\u03b5\\u03c2","\\u03a5\\u03c8\\u03b7\\u03bb\\u03ae \\u03c0\\u03c1\\u03bf\\u03c4\\u03b5\\u03c1\\u03b1\\u03b9\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1 \\u03c3\\u03c4\\u03b9\\u03c2 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03b3\\u03b5\\u03bb\\u03af\\u03b5\\u03c2","\\u03a0\\u03c1\\u03bf\\u03c4\\u03b5\\u03c1\\u03b1\\u03b9\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1 \\u03c3\\u03c4\\u03b7\\u03bd \\u03c5\\u03c0\\u03bf\\u03c3\\u03c4\\u03ae\\u03c1\\u03b9\\u03be\\u03b7","\\u03a4\\u03b7\\u03bb\\u03b5\\u03c6\\u03c9\\u03bd\\u03b9\\u03ba\\u03ae \\u03c5\\u03c0\\u03bf\\u03c3\\u03c4\\u03ae\\u03c1\\u03b9\\u03be\\u03b7","\\u0395\\u03b9\\u03b4\\u03b9\\u03ba\\u03ad\\u03c2 \\u03c4\\u03b9\\u03bc\\u03ad\\u03c2 \\u03b3\\u03b9\\u03b1 \\u03bc\\u03b5\\u03b3\\u03ac\\u03bb\\u03b5\\u03c2 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03b3\\u03b5\\u03bb\\u03af\\u03b5\\u03c2"]	t	2025-07-23 15:09:22	2025-07-23 15:09:22
6	Ετήσιο Πακέτο Επιχείρησης	business	599.99	annually	12	\N	["\\u03a0\\u03c1\\u03cc\\u03c3\\u03b2\\u03b1\\u03c3\\u03b7 \\u03c3\\u03b5 \\u03cc\\u03bb\\u03bf\\u03c5\\u03c2 \\u03c4\\u03bf\\u03c5\\u03c2 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03c9\\u03b3\\u03bf\\u03cd\\u03c2","\\u0391\\u03c0\\u03b5\\u03c1\\u03b9\\u03cc\\u03c1\\u03b9\\u03c3\\u03c4\\u03b5\\u03c2 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03b3\\u03b5\\u03bb\\u03af\\u03b5\\u03c2","\\u03a5\\u03c8\\u03b7\\u03bb\\u03ae \\u03c0\\u03c1\\u03bf\\u03c4\\u03b5\\u03c1\\u03b1\\u03b9\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1 \\u03c3\\u03c4\\u03b9\\u03c2 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03b3\\u03b5\\u03bb\\u03af\\u03b5\\u03c2","\\u03a0\\u03c1\\u03bf\\u03c4\\u03b5\\u03c1\\u03b1\\u03b9\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1 \\u03c3\\u03c4\\u03b7\\u03bd \\u03c5\\u03c0\\u03bf\\u03c3\\u03c4\\u03ae\\u03c1\\u03b9\\u03be\\u03b7","\\u03a4\\u03b7\\u03bb\\u03b5\\u03c6\\u03c9\\u03bd\\u03b9\\u03ba\\u03ae \\u03c5\\u03c0\\u03bf\\u03c3\\u03c4\\u03ae\\u03c1\\u03b9\\u03be\\u03b7","\\u0395\\u03b9\\u03b4\\u03b9\\u03ba\\u03ad\\u03c2 \\u03c4\\u03b9\\u03bc\\u03ad\\u03c2 \\u03b3\\u03b9\\u03b1 \\u03bc\\u03b5\\u03b3\\u03ac\\u03bb\\u03b5\\u03c2 \\u03c0\\u03b1\\u03c1\\u03b1\\u03b3\\u03b3\\u03b5\\u03bb\\u03af\\u03b5\\u03c2","\\u0388\\u03ba\\u03c0\\u03c4\\u03c9\\u03c3\\u03b7 2 \\u03bc\\u03b7\\u03bd\\u03ce\\u03bd","\\u03a0\\u03c1\\u03bf\\u03c3\\u03c9\\u03c0\\u03b9\\u03ba\\u03cc\\u03c2 \\u03c3\\u03cd\\u03bc\\u03b2\\u03bf\\u03c5\\u03bb\\u03bf\\u03c2"]	t	2025-07-23 15:09:22	2025-07-23 15:09:22
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, plan_id, subscribable_type, subscribable_id, status, start_date, end_date, auto_renew, payment_id, last_payment_date, next_payment_date, cancellation_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenant_themes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_themes (id, tenant_id, primary_color, secondary_color, accent_color, background_color, text_color, font_family, logo_url, favicon_url, custom_css, settings, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, slug, domain, subdomain, plan, status, owner_id, settings, subscription_expires_at, trial_ends_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: user_behavior_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_behavior_events (id, user_id, session_id, event_type, product_id, category_id, producer_id, search_query, page_url, referrer, user_agent, ip_address, device_type, browser, os, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: user_preference_updates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_preference_updates (id, user_id, product_id, action, weight, context, created_at) FROM stdin;
\.


--
-- Data for Name: user_product_interactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_product_interactions (id, user_id, product_id, rating, interaction_count, last_interaction, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, email_verified_at, password, phone, role, remember_token, created_at, updated_at, tenant_id, is_active, stripe_customer_id, quickbooks_customer_id, quickbooks_synced_at, google_id, avatar) FROM stdin;
1	Producer User 1	producer1@dixis.gr	\N	$2y$12$X.wuire326jvBHDwLBmqe.cyw2MsX9VNtBHdoA9T46zP3BocUm3zK	\N	producer	\N	2025-07-23 12:45:18	2025-07-23 12:45:18	\N	t	\N	\N	\N	\N	\N
2	Producer User 2	producer2@dixis.gr	\N	$2y$12$0e3gks1Ctq2ZehtylWz6YuQfNwWXgIVktcRLlImHg.1YlLdE0sC.q	\N	producer	\N	2025-07-23 12:45:18	2025-07-23 12:45:18	\N	t	\N	\N	\N	\N	\N
3	Producer User 3	producer3@dixis.gr	\N	$2y$12$e5ejpN1srbiTZl.jZW5ZKua.rmHgaFlpbMcqvjAtgaaIKRFPFYCz2	\N	producer	\N	2025-07-23 12:45:19	2025-07-23 12:45:19	\N	t	\N	\N	\N	\N	\N
4	Producer User 4	producer4@dixis.gr	\N	$2y$12$5Zv4IfsBj3fVqF5SaHgmjeM5tXO7tXXi1geVyxDkd4c.9.XulxGju	\N	producer	\N	2025-07-23 12:45:19	2025-07-23 12:45:19	\N	t	\N	\N	\N	\N	\N
5	Producer User 5	producer5@dixis.gr	\N	$2y$12$5vUW26fPhkGsDPH0XWY6iuYvpATDXHyn2x28T3NYP1Tnthl5CeSru	\N	producer	\N	2025-07-23 12:45:19	2025-07-23 12:45:19	\N	t	\N	\N	\N	\N	\N
6	Test User Context	test.context@dixis.gr	\N	$2y$12$CDBvRD.DrxS0Cxb.pGViYuwRxqtNtfalcLlBFVysbTSHMyqPXHWPq	\N	consumer	\N	2025-07-23 21:09:49	2025-07-23 21:09:49	\N	t	\N	\N	\N	\N	\N
7	Context Engineer	context.engineer@dixis.gr	\N	$2y$12$FMniNQzNIbuvqdVeRMlH3OUV0v8aGXz94ifsBzroXI4DeWi4zEggW	\N	consumer	\N	2025-07-23 21:10:59	2025-07-23 21:10:59	\N	t	\N	\N	\N	\N	\N
8	Config Test User	config.test@dixis.gr	\N	$2y$12$Pvco4IkwXVQUH27mmuS41eEuYRhUTxJsA6LhfzOGiDidWTRyld1Rm	\N	consumer	\N	2025-07-23 21:40:22	2025-07-23 21:40:22	\N	t	\N	\N	\N	\N	\N
9	Test User	test@example.com	\N	$2y$12$b5.56VfC/sxhkjhzt9Y32OoZ7hYw37om2QXcaIrlxApC/Fi.81z8u	\N	consumer	\N	2025-07-23 22:05:57	2025-07-23 22:05:57	\N	t	\N	\N	\N	\N	\N
10	Test Frontend User	testfrontend@example.com	\N	$2y$12$4oItu1kalo4NzqsC4u6QEOrfu1FOJzgbGwYa50KMngl7Y1vYzLEDG	\N	consumer	\N	2025-07-24 03:59:10	2025-07-24 03:59:10	\N	t	\N	\N	\N	\N	\N
11	Frontend Integration Test	frontendtest@example.com	\N	$2y$12$2jWTEFwuMvzua8yiFCC8J.xoiD6.5qDK2oGaOthVA6MLupexANAcO	\N	consumer	\N	2025-07-24 04:00:45	2025-07-24 04:00:45	\N	t	\N	\N	\N	\N	\N
12	Taverna Mykonos Chain	orders@tavernamykonos.gr	\N	$2y$12$YaeJEba/Mb3hLaDbttnviuoggOJX97V.qNbLuDpomBSuuDhb8YuGy	\N	business_user	\N	2025-07-24 04:54:22	2025-07-24 04:54:22	\N	t	\N	\N	\N	\N	\N
13	Delicatessen Athens	purchasing@delicatessen-athens.gr	\N	$2y$12$JeLmEar69/liTclviOT5lu.TVpWmPHHmqxgphOQBIfxoGK.nz3IbS	\N	business_user	\N	2025-07-24 04:54:22	2025-07-24 04:54:22	\N	t	\N	\N	\N	\N	\N
14	Santorini Resort Group	procurement@santorini-resorts.gr	\N	$2y$12$uKUu7Fh1Snu8kU/YU5tGEOZkSMTccUrWyltyf8RR5UqHkFtHKUnYi	\N	business_user	\N	2025-07-24 04:54:22	2025-07-24 04:54:22	\N	t	\N	\N	\N	\N	\N
18	Ελαιώνες Καλαμάτας	info@elaioneskalamatas.gr	2025-07-24 06:20:52	$2y$12$7Y7oNDWYi8eQIcBFkLZqVu2IjF.HkJHrryfobw/o4t5bL8Ijq9VBm	\N	producer	\N	2025-07-24 06:20:52	2025-07-24 06:20:52	\N	t	\N	\N	\N	\N	\N
19	Αμπελώνες Νεμέας	info@ampelones-nemeas.gr	2025-07-24 06:20:53	$2y$12$FE.9GRq/0qbPdZDK8bs0F.VuyvZTsPtp8mJh1U/cfSP0BI.z60pJC	\N	producer	\N	2025-07-24 06:20:53	2025-07-24 06:20:53	\N	t	\N	\N	\N	\N	\N
20	Μελισσοκομείο Χαλκιδικής	info@melissokomeiochalkidikis.gr	2025-07-24 06:20:53	$2y$12$vGzFPzxW4mSK8pwH4l6XHOd4GMONH4NqKcSpsGa/9kRLI/XuZyiTq	\N	producer	\N	2025-07-24 06:20:53	2025-07-24 06:20:53	\N	t	\N	\N	\N	\N	\N
21	Test Consumer	consumer1753378985@example.com	\N	$2y$12$MK8rj7U3koYBEvyDQiRUoecUF34/iR8CIELY31FTfW4immQ/fm706	\N	consumer	\N	2025-07-24 17:43:05	2025-07-24 17:43:05	\N	t	\N	\N	\N	\N	\N
22	Auto Test	autotest1753379670@example.com	\N	$2y$12$RPpYNug7VefUIh3txZNPVO.nyxMlGLkg/CtaqSx/JPVu80n7sTIxS	\N	consumer	\N	2025-07-24 17:54:30	2025-07-24 17:54:30	\N	t	\N	\N	\N	\N	\N
23	Test User	test1753387699526@dixis.gr	\N	$2y$12$hn7dsQrpqOrimE2Ka0/YdutC1B4A1W1/6RgR7O77rNfkq9UlfX3I6	\N	consumer	\N	2025-07-24 20:08:19	2025-07-24 20:08:19	\N	t	\N	\N	\N	\N	\N
\.


--
-- Data for Name: weight_tiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weight_tiers (id, code, min_weight_grams, max_weight_grams, description) FROM stdin;
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, user_id, product_id, created_at, updated_at) FROM stdin;
\.


--
-- Name: additional_charges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.additional_charges_id_seq', 1, false);


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.addresses_id_seq', 1, false);


--
-- Name: adoptable_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adoptable_items_id_seq', 1, false);


--
-- Name: adoption_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adoption_plans_id_seq', 1, false);


--
-- Name: adoption_updates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adoption_updates_id_seq', 1, false);


--
-- Name: adoptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adoptions_id_seq', 1, false);


--
-- Name: business_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_users_id_seq', 1, false);


--
-- Name: businesses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.businesses_id_seq', 1, false);


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 8, true);


--
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carts_id_seq', 9, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 16, true);


--
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 1, false);


--
-- Name: contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contracts_id_seq', 1, false);


--
-- Name: delivery_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.delivery_methods_id_seq', 1, false);


--
-- Name: extra_weight_charges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.extra_weight_charges_id_seq', 1, false);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorites_id_seq', 1, false);


--
-- Name: integration_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.integration_logs_id_seq', 1, false);


--
-- Name: integration_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.integration_settings_id_seq', 1, false);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_items_id_seq', 1, false);


--
-- Name: invoice_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_payments_id_seq', 1, false);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 112, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 10, true);


--
-- Name: postal_code_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.postal_code_zones_id_seq', 40, true);


--
-- Name: producer_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producer_documents_id_seq', 1, false);


--
-- Name: producer_environmental_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producer_environmental_stats_id_seq', 1, false);


--
-- Name: producer_free_shipping_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producer_free_shipping_id_seq', 3, true);


--
-- Name: producer_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producer_media_id_seq', 1, false);


--
-- Name: producer_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producer_profiles_id_seq', 1, false);


--
-- Name: producer_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producer_questions_id_seq', 1, false);


--
-- Name: producer_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producer_reviews_id_seq', 1, false);


--
-- Name: producer_shipping_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producer_shipping_methods_id_seq', 1, false);


--
-- Name: producer_shipping_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producer_shipping_rates_id_seq', 1, false);


--
-- Name: producers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producers_id_seq', 8, true);


--
-- Name: product_attribute_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_attribute_values_id_seq', 1, false);


--
-- Name: product_attributes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_attributes_id_seq', 1, false);


--
-- Name: product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_categories_id_seq', 1, false);


--
-- Name: product_category_relations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_category_relations_id_seq', 1, false);


--
-- Name: product_cost_breakdowns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_cost_breakdowns_id_seq', 1, false);


--
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 1, false);


--
-- Name: product_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_questions_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 70, true);


--
-- Name: quickbooks_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quickbooks_tokens_id_seq', 1, false);


--
-- Name: quote_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quote_items_id_seq', 1, false);


--
-- Name: quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quotes_id_seq', 1, false);


--
-- Name: recommendation_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recommendation_logs_id_seq', 1, false);


--
-- Name: revenue_shares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.revenue_shares_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 10, true);


--
-- Name: shipping_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shipping_rates_id_seq', 1, false);


--
-- Name: shipping_tracking_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shipping_tracking_events_id_seq', 1, false);


--
-- Name: shipping_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shipping_zones_id_seq', 1, false);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 6, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: tenant_themes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tenant_themes_id_seq', 1, false);


--
-- Name: tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tenants_id_seq', 1, false);


--
-- Name: user_behavior_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_behavior_events_id_seq', 1, false);


--
-- Name: user_preference_updates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_preference_updates_id_seq', 1, false);


--
-- Name: user_product_interactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_product_interactions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 23, true);


--
-- Name: weight_tiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.weight_tiers_id_seq', 1, false);


--
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wishlists_id_seq', 1, false);


--
-- Name: additional_charges additional_charges_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.additional_charges
    ADD CONSTRAINT additional_charges_code_unique UNIQUE (code);


--
-- Name: additional_charges additional_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.additional_charges
    ADD CONSTRAINT additional_charges_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: adoptable_items adoptable_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptable_items
    ADD CONSTRAINT adoptable_items_pkey PRIMARY KEY (id);


--
-- Name: adoptable_items adoptable_items_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptable_items
    ADD CONSTRAINT adoptable_items_slug_unique UNIQUE (slug);


--
-- Name: adoption_plans adoption_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoption_plans
    ADD CONSTRAINT adoption_plans_pkey PRIMARY KEY (id);


--
-- Name: adoption_updates adoption_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoption_updates
    ADD CONSTRAINT adoption_updates_pkey PRIMARY KEY (id);


--
-- Name: adoptions adoptions_certificate_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_certificate_number_unique UNIQUE (certificate_number);


--
-- Name: adoptions adoptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_pkey PRIMARY KEY (id);


--
-- Name: business_users business_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_pkey PRIMARY KEY (id);


--
-- Name: business_users business_users_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_user_id_unique UNIQUE (user_id);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: cart_items cart_items_cart_id_product_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_product_id_unique UNIQUE (cart_id, product_id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: carts carts_session_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_session_id_unique UNIQUE (session_id);


--
-- Name: carts carts_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_unique UNIQUE (user_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_contract_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_contract_number_unique UNIQUE (contract_number);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: delivery_methods delivery_methods_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_methods
    ADD CONSTRAINT delivery_methods_code_unique UNIQUE (code);


--
-- Name: delivery_methods delivery_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_methods
    ADD CONSTRAINT delivery_methods_pkey PRIMARY KEY (id);


--
-- Name: extra_weight_charges extra_weight_charge_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extra_weight_charges
    ADD CONSTRAINT extra_weight_charge_unique UNIQUE (shipping_zone_id, delivery_method_id);


--
-- Name: extra_weight_charges extra_weight_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extra_weight_charges
    ADD CONSTRAINT extra_weight_charges_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_product_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_product_id_unique UNIQUE (user_id, product_id);


--
-- Name: integration_logs integration_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_logs
    ADD CONSTRAINT integration_logs_pkey PRIMARY KEY (id);


--
-- Name: integration_settings integration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_pkey PRIMARY KEY (id);


--
-- Name: integration_settings integration_settings_service_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_service_user_id_unique UNIQUE (service, user_id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoice_payments invoice_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_payments
    ADD CONSTRAINT invoice_payments_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_stripe_payment_intent_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_stripe_payment_intent_id_unique UNIQUE (stripe_payment_intent_id);


--
-- Name: payments payments_transaction_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_id_unique UNIQUE (transaction_id);


--
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: postal_code_zones postal_code_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postal_code_zones
    ADD CONSTRAINT postal_code_zones_pkey PRIMARY KEY (id);


--
-- Name: postal_code_zones postal_code_zones_postal_code_prefix_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postal_code_zones
    ADD CONSTRAINT postal_code_zones_postal_code_prefix_unique UNIQUE (postal_code_prefix);


--
-- Name: producer_documents producer_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_documents
    ADD CONSTRAINT producer_documents_pkey PRIMARY KEY (id);


--
-- Name: producer_environmental_stats producer_environmental_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_environmental_stats
    ADD CONSTRAINT producer_environmental_stats_pkey PRIMARY KEY (id);


--
-- Name: producer_free_shipping producer_free_shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_free_shipping
    ADD CONSTRAINT producer_free_shipping_pkey PRIMARY KEY (id);


--
-- Name: producer_free_shipping producer_free_shipping_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_free_shipping
    ADD CONSTRAINT producer_free_shipping_unique UNIQUE (producer_id, shipping_zone_id, delivery_method_id);


--
-- Name: producer_media producer_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_media
    ADD CONSTRAINT producer_media_pkey PRIMARY KEY (id);


--
-- Name: producer_shipping_methods producer_method_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_methods
    ADD CONSTRAINT producer_method_unique UNIQUE (producer_id, delivery_method_id);


--
-- Name: producer_profiles producer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_profiles
    ADD CONSTRAINT producer_profiles_pkey PRIMARY KEY (id);


--
-- Name: producer_profiles producer_profiles_tax_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_profiles
    ADD CONSTRAINT producer_profiles_tax_number_unique UNIQUE (tax_number);


--
-- Name: producer_questions producer_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_questions
    ADD CONSTRAINT producer_questions_pkey PRIMARY KEY (id);


--
-- Name: producer_reviews producer_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_reviews
    ADD CONSTRAINT producer_reviews_pkey PRIMARY KEY (id);


--
-- Name: producer_reviews producer_reviews_user_id_producer_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_reviews
    ADD CONSTRAINT producer_reviews_user_id_producer_id_unique UNIQUE (user_id, producer_id);


--
-- Name: producer_shipping_methods producer_shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_methods
    ADD CONSTRAINT producer_shipping_methods_pkey PRIMARY KEY (id);


--
-- Name: producer_shipping_rates producer_shipping_rate_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_rates
    ADD CONSTRAINT producer_shipping_rate_unique UNIQUE (producer_id, shipping_zone_id, weight_tier_id, delivery_method_id);


--
-- Name: producer_shipping_rates producer_shipping_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_rates
    ADD CONSTRAINT producer_shipping_rates_pkey PRIMARY KEY (id);


--
-- Name: producers producers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producers
    ADD CONSTRAINT producers_pkey PRIMARY KEY (id);


--
-- Name: producers producers_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producers
    ADD CONSTRAINT producers_user_id_unique UNIQUE (user_id);


--
-- Name: product_attribute_values product_attribute_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_pkey PRIMARY KEY (id);


--
-- Name: product_attribute_values product_attribute_values_product_id_attribute_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_product_id_attribute_id_unique UNIQUE (product_id, attribute_id);


--
-- Name: product_attributes product_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (id);


--
-- Name: product_attributes product_attributes_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_slug_unique UNIQUE (slug);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_slug_unique UNIQUE (slug);


--
-- Name: product_category_relations product_category_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_relations
    ADD CONSTRAINT product_category_relations_pkey PRIMARY KEY (id);


--
-- Name: product_category_relations product_category_relations_product_id_category_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_relations
    ADD CONSTRAINT product_category_relations_product_id_category_id_unique UNIQUE (product_id, category_id);


--
-- Name: product_cost_breakdowns product_cost_breakdowns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_cost_breakdowns
    ADD CONSTRAINT product_cost_breakdowns_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_questions product_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_questions
    ADD CONSTRAINT product_questions_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_unique UNIQUE (sku);


--
-- Name: products products_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_unique UNIQUE (slug);


--
-- Name: quickbooks_tokens quickbooks_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quickbooks_tokens
    ADD CONSTRAINT quickbooks_tokens_pkey PRIMARY KEY (id);


--
-- Name: quickbooks_tokens quickbooks_tokens_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quickbooks_tokens
    ADD CONSTRAINT quickbooks_tokens_user_id_unique UNIQUE (user_id);


--
-- Name: quote_items quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_quote_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_quote_number_unique UNIQUE (quote_number);


--
-- Name: recommendation_logs recommendation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendation_logs
    ADD CONSTRAINT recommendation_logs_pkey PRIMARY KEY (id);


--
-- Name: revenue_shares revenue_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_shares
    ADD CONSTRAINT revenue_shares_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_user_id_product_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_product_id_unique UNIQUE (user_id, product_id);


--
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_unique UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: shipping_rates shipping_rate_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rate_unique UNIQUE (shipping_zone_id, weight_tier_id, delivery_method_id);


--
-- Name: shipping_rates shipping_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_pkey PRIMARY KEY (id);


--
-- Name: shipping_tracking_events shipping_tracking_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_tracking_events
    ADD CONSTRAINT shipping_tracking_events_pkey PRIMARY KEY (id);


--
-- Name: shipping_zones shipping_zones_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_name_unique UNIQUE (name);


--
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tenant_themes tenant_themes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_themes
    ADD CONSTRAINT tenant_themes_pkey PRIMARY KEY (id);


--
-- Name: tenant_themes tenant_themes_tenant_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_themes
    ADD CONSTRAINT tenant_themes_tenant_id_unique UNIQUE (tenant_id);


--
-- Name: tenants tenants_domain_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_domain_unique UNIQUE (domain);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);


--
-- Name: tenants tenants_subdomain_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_subdomain_unique UNIQUE (subdomain);


--
-- Name: user_behavior_events user_behavior_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_behavior_events
    ADD CONSTRAINT user_behavior_events_pkey PRIMARY KEY (id);


--
-- Name: user_preference_updates user_preference_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preference_updates
    ADD CONSTRAINT user_preference_updates_pkey PRIMARY KEY (id);


--
-- Name: user_product_interactions user_product_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_product_interactions
    ADD CONSTRAINT user_product_interactions_pkey PRIMARY KEY (id);


--
-- Name: user_product_interactions user_product_interactions_user_id_product_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_product_interactions
    ADD CONSTRAINT user_product_interactions_user_id_product_id_unique UNIQUE (user_id, product_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_google_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_unique UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_stripe_customer_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_stripe_customer_id_unique UNIQUE (stripe_customer_id);


--
-- Name: weight_tiers weight_tiers_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_tiers
    ADD CONSTRAINT weight_tiers_code_unique UNIQUE (code);


--
-- Name: weight_tiers weight_tiers_min_weight_grams_max_weight_grams_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_tiers
    ADD CONSTRAINT weight_tiers_min_weight_grams_max_weight_grams_unique UNIQUE (min_weight_grams, max_weight_grams);


--
-- Name: weight_tiers weight_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_tiers
    ADD CONSTRAINT weight_tiers_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_user_id_product_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_product_id_unique UNIQUE (user_id, product_id);


--
-- Name: business_users_business_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX business_users_business_type_index ON public.business_users USING btree (business_type);


--
-- Name: business_users_discount_tier_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX business_users_discount_tier_index ON public.business_users USING btree (discount_tier);


--
-- Name: business_users_status_verification_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX business_users_status_verification_status_index ON public.business_users USING btree (status, verification_status);


--
-- Name: carts_session_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX carts_session_id_index ON public.carts USING btree (session_id);


--
-- Name: categories_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_tenant_id_index ON public.categories USING btree (tenant_id);


--
-- Name: contracts_business_user_id_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contracts_business_user_id_status_index ON public.contracts USING btree (business_user_id, status);


--
-- Name: contracts_start_date_end_date_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contracts_start_date_end_date_index ON public.contracts USING btree (start_date, end_date);


--
-- Name: contracts_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contracts_status_index ON public.contracts USING btree (status);


--
-- Name: contracts_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contracts_type_index ON public.contracts USING btree (type);


--
-- Name: idx_cart_items_cart_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_cart_product ON public.cart_items USING btree (cart_id, product_id);


--
-- Name: idx_cart_items_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_product_id ON public.cart_items USING btree (product_id);


--
-- Name: idx_carts_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_expires_at ON public.carts USING btree (expires_at);


--
-- Name: idx_carts_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_session_id ON public.carts USING btree (session_id);


--
-- Name: idx_carts_user_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_user_expires ON public.carts USING btree (user_id, expires_at);


--
-- Name: idx_categories_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_order_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_product ON public.order_items USING btree (order_id, product_id);


--
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_orders_created_amount; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_amount ON public.orders USING btree (created_at, total_amount);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status_created ON public.orders USING btree (status, created_at);


--
-- Name: idx_orders_total_amount; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_total_amount ON public.orders USING btree (total_amount);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_orders_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_status ON public.orders USING btree (user_id, status);


--
-- Name: idx_producers_business_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producers_business_name ON public.producers USING btree (business_name);


--
-- Name: idx_producers_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producers_user_id ON public.producers USING btree (user_id);


--
-- Name: idx_producers_verified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producers_verified ON public.producers USING btree (verified);


--
-- Name: idx_producers_verified_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producers_verified_created ON public.producers USING btree (verified, created_at);


--
-- Name: idx_product_category_both; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_category_both ON public.product_category_relations USING btree (product_id, category_id);


--
-- Name: idx_product_category_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_category_category ON public.product_category_relations USING btree (category_id);


--
-- Name: idx_product_category_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_category_product ON public.product_category_relations USING btree (product_id);


--
-- Name: idx_product_images_product_sort; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_product_sort ON public.product_images USING btree (product_id, sort_order);


--
-- Name: idx_products_active_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_created ON public.products USING btree (is_active, created_at);


--
-- Name: idx_products_active_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_featured ON public.products USING btree (is_active, is_featured);


--
-- Name: idx_products_active_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_price ON public.products USING btree (is_active, price);


--
-- Name: idx_products_category_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category_active ON public.products USING btree (category_id, is_active);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: idx_products_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_created_at ON public.products USING btree (created_at);


--
-- Name: idx_products_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_is_active ON public.products USING btree (is_active);


--
-- Name: idx_products_is_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_is_featured ON public.products USING btree (is_featured);


--
-- Name: idx_products_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_price ON public.products USING btree (price);


--
-- Name: idx_products_producer_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_producer_active ON public.products USING btree (producer_id, is_active);


--
-- Name: idx_products_producer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_producer_id ON public.products USING btree (producer_id);


--
-- Name: idx_products_stock; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_stock ON public.products USING btree (stock);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_role_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role_created ON public.users USING btree (role, created_at);


--
-- Name: integration_logs_model_type_model_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX integration_logs_model_type_model_id_index ON public.integration_logs USING btree (model_type, model_id);


--
-- Name: integration_logs_service_name_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX integration_logs_service_name_status_index ON public.integration_logs USING btree (service_name, status);


--
-- Name: integration_settings_service_is_active_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX integration_settings_service_is_active_index ON public.integration_settings USING btree (service, is_active);


--
-- Name: invoice_items_invoice_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_items_invoice_id_index ON public.invoice_items USING btree (invoice_id);


--
-- Name: invoice_items_product_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_items_product_id_index ON public.invoice_items USING btree (product_id);


--
-- Name: invoice_items_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_items_tenant_id_index ON public.invoice_items USING btree (tenant_id);


--
-- Name: invoice_payments_invoice_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_payments_invoice_id_index ON public.invoice_payments USING btree (invoice_id);


--
-- Name: invoice_payments_payment_method_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_payments_payment_method_status_index ON public.invoice_payments USING btree (payment_method, status);


--
-- Name: invoice_payments_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_payments_tenant_id_index ON public.invoice_payments USING btree (tenant_id);


--
-- Name: invoice_payments_transaction_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_payments_transaction_id_index ON public.invoice_payments USING btree (transaction_id);


--
-- Name: invoices_invoice_number_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_invoice_number_index ON public.invoices USING btree (invoice_number);


--
-- Name: invoices_status_due_date_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_status_due_date_index ON public.invoices USING btree (status, due_date);


--
-- Name: invoices_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_tenant_id_index ON public.invoices USING btree (tenant_id);


--
-- Name: invoices_user_id_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_user_id_status_index ON public.invoices USING btree (user_id, status);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: model_has_permissions_model_id_model_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_has_permissions_model_id_model_type_index ON public.model_has_permissions USING btree (model_id, model_type);


--
-- Name: model_has_roles_model_id_model_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_has_roles_model_id_model_type_index ON public.model_has_roles USING btree (model_id, model_type);


--
-- Name: orders_business_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_business_user_id_index ON public.orders USING btree (business_user_id);


--
-- Name: orders_delivered_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_delivered_at_index ON public.orders USING btree (delivered_at);


--
-- Name: orders_order_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_order_type_index ON public.orders USING btree (order_type);


--
-- Name: orders_payment_due_date_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_payment_due_date_index ON public.orders USING btree (payment_due_date);


--
-- Name: orders_quickbooks_invoice_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_quickbooks_invoice_id_index ON public.orders USING btree (quickbooks_invoice_id);


--
-- Name: orders_shipped_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_shipped_at_index ON public.orders USING btree (shipped_at);


--
-- Name: orders_shipping_provider_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_shipping_provider_index ON public.orders USING btree (shipping_provider);


--
-- Name: orders_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_tenant_id_index ON public.orders USING btree (tenant_id);


--
-- Name: orders_tracking_number_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_tracking_number_index ON public.orders USING btree (tracking_number);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: producer_profiles_location_lat_location_lng_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX producer_profiles_location_lat_location_lng_index ON public.producer_profiles USING btree (location_lat, location_lng);


--
-- Name: producer_profiles_trust_level_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX producer_profiles_trust_level_index ON public.producer_profiles USING btree (trust_level);


--
-- Name: producer_profiles_verification_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX producer_profiles_verification_status_index ON public.producer_profiles USING btree (verification_status);


--
-- Name: producers_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX producers_tenant_id_index ON public.producers USING btree (tenant_id);


--
-- Name: product_questions_product_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_questions_product_id_index ON public.product_questions USING btree (product_id);


--
-- Name: products_b2b_available_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_b2b_available_index ON public.products USING btree (b2b_available);


--
-- Name: products_min_order_quantity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_min_order_quantity_index ON public.products USING btree (min_order_quantity);


--
-- Name: products_producer_id_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_producer_id_status_index ON public.products USING btree (producer_id, status);


--
-- Name: products_quickbooks_item_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_quickbooks_item_id_index ON public.products USING btree (quickbooks_item_id);


--
-- Name: products_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_status_index ON public.products USING btree (status);


--
-- Name: products_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_tenant_id_index ON public.products USING btree (tenant_id);


--
-- Name: quickbooks_tokens_user_id_company_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quickbooks_tokens_user_id_company_id_index ON public.quickbooks_tokens USING btree (user_id, company_id);


--
-- Name: quote_items_product_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quote_items_product_id_index ON public.quote_items USING btree (product_id);


--
-- Name: quote_items_quote_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quote_items_quote_id_index ON public.quote_items USING btree (quote_id);


--
-- Name: quotes_business_user_id_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quotes_business_user_id_status_index ON public.quotes USING btree (business_user_id, status);


--
-- Name: quotes_created_by_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quotes_created_by_index ON public.quotes USING btree (created_by);


--
-- Name: quotes_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quotes_status_index ON public.quotes USING btree (status);


--
-- Name: quotes_valid_until_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quotes_valid_until_index ON public.quotes USING btree (valid_until);


--
-- Name: recommendation_logs_algorithm_served_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recommendation_logs_algorithm_served_at_index ON public.recommendation_logs USING btree (algorithm, served_at);


--
-- Name: recommendation_logs_clicked_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recommendation_logs_clicked_at_index ON public.recommendation_logs USING btree (clicked_at);


--
-- Name: recommendation_logs_context_served_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recommendation_logs_context_served_at_index ON public.recommendation_logs USING btree (context, served_at);


--
-- Name: recommendation_logs_user_id_served_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recommendation_logs_user_id_served_at_index ON public.recommendation_logs USING btree (user_id, served_at);


--
-- Name: revenue_shares_payout_date_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX revenue_shares_payout_date_index ON public.revenue_shares USING btree (payout_date);


--
-- Name: revenue_shares_processed_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX revenue_shares_processed_at_index ON public.revenue_shares USING btree (processed_at);


--
-- Name: revenue_shares_tenant_id_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX revenue_shares_tenant_id_status_index ON public.revenue_shares USING btree (tenant_id, status);


--
-- Name: revenue_shares_transaction_type_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX revenue_shares_transaction_type_status_index ON public.revenue_shares USING btree (transaction_type, status);


--
-- Name: reviews_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_tenant_id_index ON public.reviews USING btree (tenant_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: shipping_tracking_events_event_timestamp_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_tracking_events_event_timestamp_index ON public.shipping_tracking_events USING btree (event_timestamp);


--
-- Name: shipping_tracking_events_event_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_tracking_events_event_type_index ON public.shipping_tracking_events USING btree (event_type);


--
-- Name: shipping_tracking_events_provider_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_tracking_events_provider_index ON public.shipping_tracking_events USING btree (provider);


--
-- Name: shipping_tracking_events_tracking_number_event_timestamp_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_tracking_events_tracking_number_event_timestamp_index ON public.shipping_tracking_events USING btree (tracking_number, event_timestamp);


--
-- Name: shipping_tracking_events_tracking_number_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_tracking_events_tracking_number_index ON public.shipping_tracking_events USING btree (tracking_number);


--
-- Name: subscriptions_subscribable_type_subscribable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_subscribable_type_subscribable_id_index ON public.subscriptions USING btree (subscribable_type, subscribable_id);


--
-- Name: tenants_status_plan_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_status_plan_index ON public.tenants USING btree (status, plan);


--
-- Name: tenants_subscription_expires_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_subscription_expires_at_index ON public.tenants USING btree (subscription_expires_at);


--
-- Name: tenants_trial_ends_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_trial_ends_at_index ON public.tenants USING btree (trial_ends_at);


--
-- Name: user_behavior_events_created_at_event_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_behavior_events_created_at_event_type_index ON public.user_behavior_events USING btree (created_at, event_type);


--
-- Name: user_behavior_events_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_behavior_events_created_at_index ON public.user_behavior_events USING btree (created_at);


--
-- Name: user_behavior_events_event_type_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_behavior_events_event_type_created_at_index ON public.user_behavior_events USING btree (event_type, created_at);


--
-- Name: user_behavior_events_event_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_behavior_events_event_type_index ON public.user_behavior_events USING btree (event_type);


--
-- Name: user_behavior_events_product_id_event_type_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_behavior_events_product_id_event_type_created_at_index ON public.user_behavior_events USING btree (product_id, event_type, created_at);


--
-- Name: user_behavior_events_search_query_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_behavior_events_search_query_index ON public.user_behavior_events USING btree (search_query);


--
-- Name: user_behavior_events_session_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_behavior_events_session_id_created_at_index ON public.user_behavior_events USING btree (session_id, created_at);


--
-- Name: user_behavior_events_session_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_behavior_events_session_id_index ON public.user_behavior_events USING btree (session_id);


--
-- Name: user_behavior_events_user_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_behavior_events_user_id_created_at_index ON public.user_behavior_events USING btree (user_id, created_at);


--
-- Name: user_preference_updates_action_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_preference_updates_action_created_at_index ON public.user_preference_updates USING btree (action, created_at);


--
-- Name: user_preference_updates_product_id_action_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_preference_updates_product_id_action_index ON public.user_preference_updates USING btree (product_id, action);


--
-- Name: user_preference_updates_user_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_preference_updates_user_id_created_at_index ON public.user_preference_updates USING btree (user_id, created_at);


--
-- Name: user_product_interactions_last_interaction_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_product_interactions_last_interaction_index ON public.user_product_interactions USING btree (last_interaction);


--
-- Name: user_product_interactions_product_id_rating_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_product_interactions_product_id_rating_index ON public.user_product_interactions USING btree (product_id, rating);


--
-- Name: user_product_interactions_user_id_rating_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_product_interactions_user_id_rating_index ON public.user_product_interactions USING btree (user_id, rating);


--
-- Name: users_quickbooks_customer_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_quickbooks_customer_id_index ON public.users USING btree (quickbooks_customer_id);


--
-- Name: users_stripe_customer_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_stripe_customer_id_index ON public.users USING btree (stripe_customer_id);


--
-- Name: users_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_tenant_id_index ON public.users USING btree (tenant_id);


--
-- Name: addresses addresses_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: adoptable_items adoptable_items_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptable_items
    ADD CONSTRAINT adoptable_items_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: adoption_plans adoption_plans_adoptable_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoption_plans
    ADD CONSTRAINT adoption_plans_adoptable_item_id_foreign FOREIGN KEY (adoptable_item_id) REFERENCES public.adoptable_items(id) ON DELETE CASCADE;


--
-- Name: adoption_updates adoption_updates_adoption_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoption_updates
    ADD CONSTRAINT adoption_updates_adoption_id_foreign FOREIGN KEY (adoption_id) REFERENCES public.adoptions(id) ON DELETE CASCADE;


--
-- Name: adoptions adoptions_adoptable_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_adoptable_item_id_foreign FOREIGN KEY (adoptable_item_id) REFERENCES public.adoptable_items(id) ON DELETE CASCADE;


--
-- Name: adoptions adoptions_adoption_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_adoption_plan_id_foreign FOREIGN KEY (adoption_plan_id) REFERENCES public.adoption_plans(id) ON DELETE CASCADE;


--
-- Name: adoptions adoptions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adoptions
    ADD CONSTRAINT adoptions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: business_users business_users_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: business_users business_users_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: businesses businesses_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: carts carts_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: categories categories_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: contracts contracts_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: contracts contracts_business_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_business_user_id_foreign FOREIGN KEY (business_user_id) REFERENCES public.business_users(id) ON DELETE CASCADE;


--
-- Name: contracts contracts_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contracts contracts_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: extra_weight_charges extra_weight_charges_delivery_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extra_weight_charges
    ADD CONSTRAINT extra_weight_charges_delivery_method_id_foreign FOREIGN KEY (delivery_method_id) REFERENCES public.delivery_methods(id) ON DELETE CASCADE;


--
-- Name: extra_weight_charges extra_weight_charges_shipping_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extra_weight_charges
    ADD CONSTRAINT extra_weight_charges_shipping_zone_id_foreign FOREIGN KEY (shipping_zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products fk_products_category_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_category_id FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: integration_settings integration_settings_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_foreign FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: invoice_payments invoice_payments_invoice_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_payments
    ADD CONSTRAINT invoice_payments_invoice_id_foreign FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: orders orders_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.addresses(id) ON DELETE RESTRICT;


--
-- Name: orders orders_business_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_business_user_id_foreign FOREIGN KEY (business_user_id) REFERENCES public.business_users(id) ON DELETE SET NULL;


--
-- Name: orders orders_contract_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_contract_id_foreign FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE SET NULL;


--
-- Name: orders orders_quote_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_quote_id_foreign FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE SET NULL;


--
-- Name: orders orders_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id) ON DELETE RESTRICT;


--
-- Name: orders orders_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: postal_code_zones postal_code_zones_shipping_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postal_code_zones
    ADD CONSTRAINT postal_code_zones_shipping_zone_id_foreign FOREIGN KEY (shipping_zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;


--
-- Name: producer_documents producer_documents_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_documents
    ADD CONSTRAINT producer_documents_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: producer_environmental_stats producer_environmental_stats_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_environmental_stats
    ADD CONSTRAINT producer_environmental_stats_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: producer_free_shipping producer_free_shipping_delivery_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_free_shipping
    ADD CONSTRAINT producer_free_shipping_delivery_method_id_foreign FOREIGN KEY (delivery_method_id) REFERENCES public.delivery_methods(id) ON DELETE CASCADE;


--
-- Name: producer_free_shipping producer_free_shipping_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_free_shipping
    ADD CONSTRAINT producer_free_shipping_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: producer_free_shipping producer_free_shipping_shipping_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_free_shipping
    ADD CONSTRAINT producer_free_shipping_shipping_zone_id_foreign FOREIGN KEY (shipping_zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;


--
-- Name: producer_media producer_media_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_media
    ADD CONSTRAINT producer_media_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: producer_profiles producer_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_profiles
    ADD CONSTRAINT producer_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: producer_profiles producer_profiles_verified_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_profiles
    ADD CONSTRAINT producer_profiles_verified_by_foreign FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: producer_questions producer_questions_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_questions
    ADD CONSTRAINT producer_questions_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: producer_questions producer_questions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_questions
    ADD CONSTRAINT producer_questions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: producer_reviews producer_reviews_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_reviews
    ADD CONSTRAINT producer_reviews_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: producer_reviews producer_reviews_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_reviews
    ADD CONSTRAINT producer_reviews_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: producer_shipping_methods producer_shipping_methods_delivery_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_methods
    ADD CONSTRAINT producer_shipping_methods_delivery_method_id_foreign FOREIGN KEY (delivery_method_id) REFERENCES public.delivery_methods(id) ON DELETE CASCADE;


--
-- Name: producer_shipping_methods producer_shipping_methods_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_methods
    ADD CONSTRAINT producer_shipping_methods_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: producer_shipping_rates producer_shipping_rates_delivery_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_rates
    ADD CONSTRAINT producer_shipping_rates_delivery_method_id_foreign FOREIGN KEY (delivery_method_id) REFERENCES public.delivery_methods(id) ON DELETE CASCADE;


--
-- Name: producer_shipping_rates producer_shipping_rates_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_rates
    ADD CONSTRAINT producer_shipping_rates_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: producer_shipping_rates producer_shipping_rates_shipping_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_rates
    ADD CONSTRAINT producer_shipping_rates_shipping_zone_id_foreign FOREIGN KEY (shipping_zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;


--
-- Name: producer_shipping_rates producer_shipping_rates_weight_tier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_rates
    ADD CONSTRAINT producer_shipping_rates_weight_tier_id_foreign FOREIGN KEY (weight_tier_id) REFERENCES public.weight_tiers(id) ON DELETE CASCADE;


--
-- Name: producers producers_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producers
    ADD CONSTRAINT producers_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: producers producers_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producers
    ADD CONSTRAINT producers_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_attribute_values product_attribute_values_attribute_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_attribute_id_foreign FOREIGN KEY (attribute_id) REFERENCES public.product_attributes(id) ON DELETE CASCADE;


--
-- Name: product_attribute_values product_attribute_values_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_categories product_categories_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.product_categories(id) ON DELETE SET NULL;


--
-- Name: product_category_relations product_category_relations_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_relations
    ADD CONSTRAINT product_category_relations_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON DELETE CASCADE;


--
-- Name: product_category_relations product_category_relations_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_relations
    ADD CONSTRAINT product_category_relations_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_cost_breakdowns product_cost_breakdowns_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_cost_breakdowns
    ADD CONSTRAINT product_cost_breakdowns_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_questions product_questions_answered_by_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_questions
    ADD CONSTRAINT product_questions_answered_by_producer_id_foreign FOREIGN KEY (answered_by_producer_id) REFERENCES public.producers(id) ON DELETE SET NULL;


--
-- Name: product_questions product_questions_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_questions
    ADD CONSTRAINT product_questions_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_questions product_questions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_questions
    ADD CONSTRAINT product_questions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE CASCADE;


--
-- Name: products products_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: quickbooks_tokens quickbooks_tokens_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quickbooks_tokens
    ADD CONSTRAINT quickbooks_tokens_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: quote_items quote_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: quote_items quote_items_quote_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quote_id_foreign FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: quotes quotes_business_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_business_user_id_foreign FOREIGN KEY (business_user_id) REFERENCES public.business_users(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_converted_to_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_converted_to_order_id_foreign FOREIGN KEY (converted_to_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: quotes quotes_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: recommendation_logs recommendation_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendation_logs
    ADD CONSTRAINT recommendation_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: revenue_shares revenue_shares_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_shares
    ADD CONSTRAINT revenue_shares_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: revenue_shares revenue_shares_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_shares
    ADD CONSTRAINT revenue_shares_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: shipping_rates shipping_rates_delivery_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_delivery_method_id_foreign FOREIGN KEY (delivery_method_id) REFERENCES public.delivery_methods(id) ON DELETE CASCADE;


--
-- Name: shipping_rates shipping_rates_shipping_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_shipping_zone_id_foreign FOREIGN KEY (shipping_zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;


--
-- Name: shipping_rates shipping_rates_weight_tier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_weight_tier_id_foreign FOREIGN KEY (weight_tier_id) REFERENCES public.weight_tiers(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: subscriptions subscriptions_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: tenant_themes tenant_themes_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_themes
    ADD CONSTRAINT tenant_themes_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenants tenants_owner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_owner_id_foreign FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_behavior_events user_behavior_events_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_behavior_events
    ADD CONSTRAINT user_behavior_events_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: user_behavior_events user_behavior_events_producer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_behavior_events
    ADD CONSTRAINT user_behavior_events_producer_id_foreign FOREIGN KEY (producer_id) REFERENCES public.producers(id) ON DELETE SET NULL;


--
-- Name: user_behavior_events user_behavior_events_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_behavior_events
    ADD CONSTRAINT user_behavior_events_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_behavior_events user_behavior_events_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_behavior_events
    ADD CONSTRAINT user_behavior_events_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_preference_updates user_preference_updates_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preference_updates
    ADD CONSTRAINT user_preference_updates_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_preference_updates user_preference_updates_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preference_updates
    ADD CONSTRAINT user_preference_updates_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_product_interactions user_product_interactions_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_product_interactions
    ADD CONSTRAINT user_product_interactions_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_product_interactions user_product_interactions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_product_interactions
    ADD CONSTRAINT user_product_interactions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: wishlists wishlists_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

