<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class BasicTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_that_true_is_true(): void
    {
        $this->assertTrue(true);
    }

    /**
     * Test basic string operations.
     */
    public function test_string_operations(): void
    {
        $string = 'Hello, World!';
        
        $this->assertEquals('Hello, World!', $string);
        $this->assertStringContainsString('Hello', $string);
        $this->assertStringContainsString('World', $string);
        $this->assertEquals(13, strlen($string));
    }

    /**
     * Test basic array operations.
     */
    public function test_array_operations(): void
    {
        $array = ['apple', 'banana', 'orange'];
        
        $this->assertCount(3, $array);
        $this->assertContains('apple', $array);
        $this->assertContains('banana', $array);
        $this->assertContains('orange', $array);
        
        $array[] = 'grape';
        $this->assertCount(4, $array);
        $this->assertContains('grape', $array);
    }

    /**
     * Test basic math operations.
     */
    public function test_math_operations(): void
    {
        $this->assertEquals(4, 2 + 2);
        $this->assertEquals(0, 2 - 2);
        $this->assertEquals(4, 2 * 2);
        $this->assertEquals(1, 2 / 2);
        $this->assertEquals(1, 3 % 2);
    }
}
